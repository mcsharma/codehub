import { builder } from '../builder.js'
import { GraphQLError } from 'graphql'
import type { ModelUser, Repository as RepositoryRow } from '@prisma/client'
import type { prisma } from '../../prisma/db.js'

// Called directly (synchronously, not via the job queue — see
// services/git/hooks/post-receive) by a git repo's post-receive hook the
// moment a push lands on a refs/reviews/<sha> ref. There is no client-side
// `ch submit` equivalent for git repos — this mutation *is* the review
// creation/versioning step, triggered server-side by the hook instead of by
// a human/CLI, per the "no custom ch-for-git CLI" decision (see
// docs/plans/zesty-zooming-cupcake.md).
const GIT_HOOK_USERNAME = 'codehub-git-hook'

function requireGitHook(user: ModelUser | null): ModelUser {
  if (!user || user.username !== GIT_HOOK_USERNAME) {
    throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } })
  }
  return user
}

// Same duplication-over-shared-export precedent review.ts's own
// loadRepositoryByOwnerAndName comment documents — no shared export exists
// for this lookup yet.
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

// Captures the review number so a resubmit's trailer can be matched against
// an existing review — add_review_version's hg equivalent (repository.ts)
// checks a specific number it's already given as an arg; here the hook
// hands us the raw commit message and we have to find the number ourselves.
const REVIEW_ID_TRAILER_RE = /^Review-Id: D(\d+)$/m

builder.mutationField('report_git_review_push', (t) =>
  t.prismaField({
    type: 'Review',
    args: {
      owner: t.arg.string({ required: true }),
      repo: t.arg.string({ required: true }),
      sha: t.arg.string({ required: true }),
      parent_sha: t.arg.string({ required: false }),
      title: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
      pusher_username: t.arg.string({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      requireGitHook(ctx.user)

      const repo = await loadRepositoryByOwnerAndName(ctx.prisma, args.owner, args.repo)
      if (!repo) {
        throw new GraphQLError('Repository not found', { extensions: { code: 'NOT_FOUND' } })
      }
      // Defense in depth — a leaked hook token should never be usable
      // against an hg repo even if it somehow named one.
      if (repo.vcsKind !== 'GIT') {
        throw new GraphQLError('Repository is not a git repository')
      }

      // Attribute the review to the human who actually pushed, resolved via
      // the /internal/auth-check -> REMOTE_USER -> hook plumbing (see
      // web/bff/src/index.ts and services/git/hooks/post-receive) — never
      // silently fall back to the hook's own service account.
      const pusher = await ctx.prisma.modelUser.findUnique({ where: { username: args.pusher_username } })
      if (!pusher) {
        throw new GraphQLError(`Unknown pusher username: ${args.pusher_username}`)
      }

      const bookmark = `refs/reviews/${args.sha}`
      const trailerMatch = args.description.match(REVIEW_ID_TRAILER_RE)
      const reviewNumber = trailerMatch ? Number(trailerMatch[1]) : null

      if (reviewNumber !== null) {
        const existing = await ctx.prisma.review.findUnique({
          where: { repositoryId_number: { repositoryId: repo.id, number: reviewNumber } },
        })
        if (existing && existing.status !== 'LANDED' && existing.status !== 'ABANDONED') {
          const version = (await ctx.prisma.reviewVersion.count({ where: { reviewId: existing.id } })) + 1
          await ctx.prisma.reviewVersion.create({
            data: {
              reviewId: existing.id,
              version,
              headNode: args.sha,
              baseNode: args.parent_sha ?? null,
              bookmark,
            },
          })
          return ctx.prisma.review.update({
            where: { id: existing.id },
            // A resubmit after a failed land attempt returns the review to
            // OPEN — same "fix and resubmit" flow as add_review_version.
            data: existing.status === 'LAND_FAILED' ? { status: 'OPEN' } : {},
          })
        }
        // Trailer references a number that doesn't resolve to an open
        // review on this repo (landed/abandoned/never existed) — fall
        // through and create a fresh one rather than erroring, since the
        // hook has no way to reject a push post-hoc.
      }

      // Atomic per-repo counter — same race-safe UPDATE...RETURNING pattern
      // create_review uses.
      const updated = await ctx.prisma.repository.update({
        where: { id: repo.id },
        data: { nextReviewNumber: { increment: 1 } },
        select: { nextReviewNumber: true },
      })
      const review = await ctx.prisma.review.create({
        data: {
          repositoryId: repo.id,
          number: updated.nextReviewNumber,
          title: args.title,
          authorId: pusher.id,
        },
      })
      await ctx.prisma.reviewVersion.create({
        data: {
          reviewId: review.id,
          version: 1,
          headNode: args.sha,
          baseNode: args.parent_sha ?? null,
          bookmark,
        },
      })
      return review
    },
  }),
)
