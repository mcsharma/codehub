import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'
import { requireUser } from '../require-user.js'
import { ReviewStatus } from '@prisma/client'
import type { Review as ReviewRow, Repository as RepositoryRow } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { CommitObject, RepositoryObject, resolveOwnerName, requireRepoReadAccess, toCommitShape } from './repository.js'
import { fetchChangeset } from '../../repos/hgweb-client.js'
import { canAccessRepo } from '../../auth/repo-access.js'
import { enqueueLandReview } from '../../jobs/land-review.js'
import { enqueueLandGitReview } from '../../jobs/land-git-review.js'
import type { prisma } from '../../prisma/db.js'

// --- Shared helpers ---

// Mirrors the owner/name lookup repository.ts does inline for
// repository_by_owner_and_name — no shared export exists for it yet, so
// this is the same duplication level that already exists between
// repository.ts and auth/repo-access.ts.
async function loadRepositoryByOwnerAndName(
  db: typeof prisma,
  ownerName: string,
  repoName: string,
): Promise<RepositoryRow | null> {
  const user = await db.modelUser.findUnique({ where: { username: ownerName }, select: { id: true } })
  if (user) {
    return db.repository.findUnique({ where: { ownerUserId_name: { ownerUserId: user.id, name: repoName } } })
  }
  const org = await db.modelOrganization.findUnique({ where: { name: ownerName }, select: { id: true } })
  if (org) {
    return db.repository.findUnique({
      where: { ownerOrganizationId_name: { ownerOrganizationId: org.id, name: repoName } },
    })
  }
  return null
}

// create_review/add_review_version/land_review/abandon_review are all
// CLI-facing (PAT-authenticated) and require the same bar as an hg push —
// write access to the repo, same as create_repository provisioning below
// it never leaks whether a repo merely doesn't exist vs. exists-but-private,
// same masking as requireRepoReadAccess.
async function requireRepoWriteAccess(
  db: typeof prisma,
  user: { id: bigint } | null,
  ownerName: string,
  repoName: string,
): Promise<RepositoryRow> {
  const repo = await loadRepositoryByOwnerAndName(db, ownerName, repoName)
  const allowed = repo && (await canAccessRepo(user as never, ownerName, repoName, 'write'))
  if (!repo || !allowed) {
    throw new GraphQLError('Repository not found', { extensions: { code: 'NOT_FOUND' } })
  }
  return repo
}

async function loadReviewOrThrow(db: typeof prisma, repositoryId: bigint, number: number): Promise<ReviewRow> {
  const review = await db.review.findUnique({ where: { repositoryId_number: { repositoryId, number } } })
  if (!review) {
    throw new GraphQLError('Review not found', { extensions: { code: 'NOT_FOUND' } })
  }
  return review
}

// --- Enums ---

builder.enumType(ReviewStatus, { name: 'ReviewStatus' })

// --- ReviewVersion object type ---
// Like Commit/Bookmark in repository.ts, this is hgweb-backed, not a plain
// prismaObject: its one computed field (`commit`) needs the owning
// repository's owner name to call hgweb, which isn't on the ReviewVersion
// row itself — so the private _ownerName/_repoName fields carry it,
// resolved once by whichever Review field builds this shape.

interface ReviewVersionShape {
  id: bigint
  version: number
  headNode: string
  baseNode: string | null
  bookmark: string
  createdTime: Date
  _ownerName: string
  _repoName: string
}

function toReviewVersionShape(ownerName: string, repoName: string, v: {
  id: bigint
  version: number
  headNode: string
  baseNode: string | null
  bookmark: string
  createdTime: Date
}): ReviewVersionShape {
  return { ...v, _ownerName: ownerName, _repoName: repoName }
}

const ReviewVersionObject = builder.objectRef<ReviewVersionShape>('ReviewVersion').implement({
  fields: (t) => ({
    id: t.field({ type: 'ID', resolve: (v) => String(v.id) }),
    version: t.exposeInt('version'),
    head_node: t.exposeString('headNode'),
    base_node: t.exposeString('baseNode', { nullable: true }),
    bookmark: t.exposeString('bookmark'),
    created_time: t.int({ resolve: (v) => Math.floor(v.createdTime.getTime() / 1000) }),
    commit: t.field({
      type: CommitObject,
      nullable: true,
      resolve: async (v) => {
        try {
          const changeset = await fetchChangeset(v._ownerName, v._repoName, v.headNode)
          return toCommitShape(v._ownerName, v._repoName, changeset)
        } catch (err) {
          console.error('Failed to fetch review version commit:', err)
          return null
        }
      },
    }),
  }),
})

// --- Review object type ---

const ReviewObject = builder.prismaObject('Review', {
  name: 'Review',
  fields: (t) => ({
    id: exposeID(t),
    number: t.exposeInt('number'),
    title: t.exposeString('title'),
    status: t.expose('status', { type: ReviewStatus }),
    created_time: exposeTime(t, 'createdTime'),
    updated_time: exposeTime(t, 'updatedTime'),
    landed_node: t.exposeString('landedNode', { nullable: true }),
    land_error: t.exposeString('landError', { nullable: true }),
    author: t.relation('author'),
    versions: t.field({
      type: [ReviewVersionObject],
      resolve: async (review, _args, ctx) => {
        const repo = await ctx.prisma.repository.findUniqueOrThrow({ where: { id: review.repositoryId } })
        const ownerName = await resolveOwnerName(repo, ctx.prisma)
        const versions = await ctx.prisma.reviewVersion.findMany({
          where: { reviewId: review.id },
          orderBy: { version: 'asc' },
        })
        return versions.map((v) => toReviewVersionShape(ownerName, repo.name, v))
      },
    }),
    latest_version: t.field({
      type: ReviewVersionObject,
      nullable: true,
      resolve: async (review, _args, ctx) => {
        const repo = await ctx.prisma.repository.findUniqueOrThrow({ where: { id: review.repositoryId } })
        const ownerName = await resolveOwnerName(repo, ctx.prisma)
        const v = await ctx.prisma.reviewVersion.findFirst({
          where: { reviewId: review.id },
          orderBy: { version: 'desc' },
        })
        return v ? toReviewVersionShape(ownerName, repo.name, v) : null
      },
    }),
  }),
})

// --- Repository.review field ---
// Added onto the already-registered Repository object rather than in
// repository.ts itself, via Pothos's objectField — that keeps the
// dependency one-directional (review.ts imports from repository.ts, never
// the reverse), avoiding a circular import between the two files.

builder.objectField(RepositoryObject, 'review', (t) =>
  t.field({
    type: ReviewObject,
    nullable: true,
    args: { number: t.arg.int({ required: true }) },
    resolve: async (repository, args, ctx) => {
      const ownerName = await resolveOwnerName(repository, ctx.prisma)
      await requireRepoReadAccess(ctx.user, ownerName, repository.name)
      return ctx.prisma.review.findUnique({
        where: { repositoryId_number: { repositoryId: repository.id, number: args.number } },
      })
    },
  }),
)

// Plain list, not a connection — matches the "simple list" v1 scope (see
// RepoReviewsPage.tsx). Revisit if a repo's review count ever makes this
// worth paginating, same as commits already are.
builder.objectField(RepositoryObject, 'reviews', (t) =>
  t.field({
    type: [ReviewObject],
    resolve: async (repository, _args, ctx) => {
      const ownerName = await resolveOwnerName(repository, ctx.prisma)
      await requireRepoReadAccess(ctx.user, ownerName, repository.name)
      return ctx.prisma.review.findMany({
        where: { repositoryId: repository.id },
        orderBy: { createdTime: 'desc' },
      })
    },
  }),
)

// --- Mutations ---
// All CLI-facing (PAT bearer auth on /graphql — see index.ts), gated at the
// same write-access bar as an hg push (see requireRepoWriteAccess above).

builder.mutationField('create_review', (t) =>
  t.prismaField({
    type: 'Review',
    args: {
      owner: t.arg.string({ required: true }),
      repo: t.arg.string({ required: true }),
      title: t.arg.string({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const user = requireUser(ctx.user)
      const repo = await requireRepoWriteAccess(ctx.prisma, user, args.owner, args.repo)

      // Atomic per-repo counter: a single UPDATE...RETURNING is race-safe
      // under concurrent submits without a separate transaction, since
      // Postgres serializes concurrent updates to the same row.
      const updated = await ctx.prisma.repository.update({
        where: { id: repo.id },
        data: { nextReviewNumber: { increment: 1 } },
        select: { nextReviewNumber: true },
      })

      return ctx.prisma.review.create({
        data: {
          repositoryId: repo.id,
          number: updated.nextReviewNumber,
          title: args.title,
          authorId: user.id,
        },
      })
    },
  }),
)

builder.mutationField('add_review_version', (t) =>
  t.prismaField({
    type: 'Review',
    args: {
      owner: t.arg.string({ required: true }),
      repo: t.arg.string({ required: true }),
      number: t.arg.int({ required: true }),
      head_node: t.arg.string({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const user = requireUser(ctx.user)
      const repo = await requireRepoWriteAccess(ctx.prisma, user, args.owner, args.repo)
      const review = await loadReviewOrThrow(ctx.prisma, repo.id, args.number)

      if (review.status === 'LANDED') throw new GraphQLError(`D${args.number} is already landed`)
      if (review.status === 'ABANDONED') throw new GraphQLError(`D${args.number} is abandoned`)
      if (review.status === 'LANDING') throw new GraphQLError(`D${args.number} is currently landing`)

      // The node must already be on the server (ch submit pushes before
      // calling this) — fetching it here doubles as proof of that, and is
      // also where baseNode comes from, straight off the changeset's own
      // parent rather than a separate merge-base computation.
      let changeset
      try {
        changeset = await fetchChangeset(args.owner, args.repo, args.head_node)
      } catch (err) {
        console.error('add_review_version: node not found on server:', err)
        throw new GraphQLError('Commit not found on server — push it before calling add_review_version')
      }

      const trailer = new RegExp(`^Review-Id: D${args.number}$`, 'm')
      if (!trailer.test(changeset.desc)) {
        throw new GraphQLError(`Commit description is missing the "Review-Id: D${args.number}" trailer`)
      }

      const version = (await ctx.prisma.reviewVersion.count({ where: { reviewId: review.id } })) + 1
      await ctx.prisma.reviewVersion.create({
        data: {
          reviewId: review.id,
          version,
          headNode: args.head_node,
          baseNode: changeset.parents[0] ?? null,
          bookmark: `reviews/${args.head_node.slice(0, 12)}`,
        },
      })

      return ctx.prisma.review.update({
        where: { id: review.id },
        // A resubmit after a failed land attempt returns the review to
        // OPEN — this *is* the "fix and resubmit" flow.
        data: review.status === 'LAND_FAILED' ? { status: 'OPEN' } : {},
      })
    },
  }),
)

builder.mutationField('land_review', (t) =>
  t.prismaField({
    type: 'Review',
    args: {
      owner: t.arg.string({ required: true }),
      repo: t.arg.string({ required: true }),
      number: t.arg.int({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const user = requireUser(ctx.user)
      const repo = await requireRepoWriteAccess(ctx.prisma, user, args.owner, args.repo)
      const review = await loadReviewOrThrow(ctx.prisma, repo.id, args.number)

      if (review.status !== 'OPEN' && review.status !== 'LAND_FAILED') {
        throw new GraphQLError(`D${args.number} is not open (status: ${review.status})`)
      }
      const versionCount = await ctx.prisma.reviewVersion.count({ where: { reviewId: review.id } })
      if (versionCount === 0) {
        throw new GraphQLError(`D${args.number} has no submitted version yet`)
      }

      const updated = await ctx.prisma.review.update({ where: { id: review.id }, data: { status: 'LANDING' } })
      if (repo.vcsKind === 'GIT') {
        await enqueueLandGitReview(review.id)
      } else {
        await enqueueLandReview(review.id)
      }
      return updated
    },
  }),
)

builder.mutationField('abandon_review', (t) =>
  t.prismaField({
    type: 'Review',
    args: {
      owner: t.arg.string({ required: true }),
      repo: t.arg.string({ required: true }),
      number: t.arg.int({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const user = requireUser(ctx.user)
      const repo = await requireRepoWriteAccess(ctx.prisma, user, args.owner, args.repo)
      const review = await loadReviewOrThrow(ctx.prisma, repo.id, args.number)

      if (review.status === 'LANDING' || review.status === 'LANDED') {
        throw new GraphQLError(`D${args.number} can't be abandoned (status: ${review.status})`)
      }

      return ctx.prisma.review.update({ where: { id: review.id }, data: { status: 'ABANDONED' } })
    },
  }),
)
