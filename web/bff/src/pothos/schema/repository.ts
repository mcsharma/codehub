import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'
import { requireUser } from '../require-user.js'
import { RepositoryVisibility, VcsKind, Prisma } from '@prisma/client'
import type { ModelUser } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { UserObject } from './user.js'
import { OrganizationObject } from './organization.js'
import { enqueueProvisionRepo } from '../../jobs/provision-repo.js'
import { enqueueDeleteRepo } from '../../jobs/delete-repo.js'
import { enqueueProvisionGitRepo } from '../../jobs/provision-git-repo.js'
import { enqueueDeleteGitRepo } from '../../jobs/delete-git-repo.js'
import {
  fetchBookmarks,
  fetchChangeset,
  fetchDirectory,
  fetchFileLog,
  fetchRawDiff,
  fetchRawFile,
  fetchShortlog,
  type HgChangeset,
  type HgLogEntry,
} from '../../repos/hgweb-client.js'
import {
  fetchChangeset as fetchGitChangeset,
  fetchDirectory as fetchGitDirectory,
  fetchFileLog as fetchGitFileLog,
  fetchRawDiff as fetchGitRawDiff,
  fetchRawFile as fetchGitRawFile,
  fetchShortlog as fetchGitShortlog,
} from '../../repos/git-browse-client.js'
import { canAccessRepo } from '../../auth/repo-access.js'
import { resolveCursorConnection } from '@pothos/plugin-relay'
import type { prisma } from '../../prisma/db.js'

// --- Shared helpers for the hgweb-backed fields below ---

// Exported for review.ts, which needs the same owner-name resolution and
// read-access masking for hgweb-backed Review/ReviewVersion fields.
export async function resolveOwnerName(
  repository: { ownerUserId: bigint | null; ownerOrganizationId: bigint | null },
  db: typeof prisma,
): Promise<string> {
  if (repository.ownerUserId) {
    const user = await db.modelUser.findUnique({
      where: { id: repository.ownerUserId },
      select: { username: true },
    })
    if (user) return user.username
  }
  if (repository.ownerOrganizationId) {
    const org = await db.modelOrganization.findUnique({
      where: { id: repository.ownerOrganizationId },
      select: { name: true },
    })
    if (org) return org.name
  }
  throw new Error('Repository has no owner')
}

// Repos are looked up by owner+name again here (rather than trusting the
// already-loaded `repository` row) because canAccessRepo needs the owner's
// *name* to re-resolve the repo the same way the wire-protocol auth-check
// does — same function, same shape, just called from the GraphQL side this
// time. 404-shaped error (not 403) so unauthorized callers can't tell a
// private repo apart from one that doesn't exist.
export async function requireRepoReadAccess(user: ModelUser | null, ownerName: string, repoName: string): Promise<void> {
  const allowed = await canAccessRepo(user, ownerName, repoName, 'read')
  if (!allowed) {
    throw new GraphQLError('Repository not found', { extensions: { code: 'NOT_FOUND' } })
  }
}

// Shared by update_repository_visibility and delete_repository: loads a
// repo by id and requires the caller be its direct owner. Not
// canAccessRepo's broader "isAdmin" (owner OR repo-admin OR org-admin) —
// that check exists for hg push access; repo admins and org-owned repos
// aren't reachable through any UI yet, so there's nothing to authorize
// beyond plain ownership today. Same NOT_FOUND-shaped masking as
// requireRepoReadAccess, for the same reason (don't leak existence to
// callers who don't own the repo).
async function requireOwnedRepo(user: ModelUser | null, db: typeof prisma, repoId: bigint) {
  const repo = await db.repository.findUnique({ where: { id: repoId } })
  if (!repo || !user || repo.ownerUserId !== user.id) {
    throw new GraphQLError('Repository not found', { extensions: { code: 'NOT_FOUND' } })
  }
  return repo
}

// --- Enums ---

builder.enumType(RepositoryVisibility, {
  name: 'RepositoryVisibility',
})

builder.enumType(VcsKind, {
  name: 'VcsKind',
})

// --- RepositoryOwner union ---

const RepositoryOwner = builder.unionType('RepositoryOwner', {
  types: [UserObject, OrganizationObject],
  resolveType: (owner) => {
    if ('username' in owner) {
      return 'User'
    }
    return 'Organization'
  },
})

// --- Commit / Bookmark object types ---
// Backed by hgweb's JSON style, not Prisma — see repos/hgweb-client.ts.

interface CommitFileShape {
  path: string
  status: string
}

const CommitFileObject = builder.objectRef<CommitFileShape>('CommitFile').implement({
  fields: (t) => ({
    path: t.exposeString('path'),
    status: t.exposeString('status'),
  }),
})

// Exported for review.ts's ReviewVersion.commit field — a review version
// points at a real hg node, so it reuses this exact shape/fetch rather than
// duplicating a second "commit-ish" type.
export interface CommitShape {
  node: string
  short_node: string
  author: string
  date: number
  description: string
  branch: string
  tags: string[]
  bookmarks: string[]
  parents: string[]
  files: CommitFileShape[]
  // Not exposed via GraphQL — carried so the `diff` field's resolver (a
  // second, separate hgweb/git-browse fetch, only paid for when a query
  // actually asks for it) doesn't need the repository row or a second
  // permission check.
  _owner: string
  _repoName: string
  _vcsKind: VcsKind
}

export function toCommitShape(owner: string, repoName: string, c: HgChangeset, vcsKind: VcsKind): CommitShape {
  return {
    node: c.node,
    short_node: c.node.slice(0, 12),
    author: c.user,
    date: Math.floor(c.date[0]),
    description: c.desc,
    branch: c.branch,
    tags: c.tags,
    bookmarks: c.bookmarks,
    parents: c.parents,
    files: (c.files ?? []).map((f) => ({ path: f.file, status: f.status })),
    _owner: owner,
    _repoName: repoName,
    _vcsKind: vcsKind,
  }
}

export const CommitObject = builder.objectRef<CommitShape>('Commit').implement({
  fields: (t) => ({
    node: t.exposeString('node'),
    short_node: t.exposeString('short_node'),
    author: t.exposeString('author'),
    date: t.exposeInt('date'),
    description: t.exposeString('description'),
    branch: t.exposeString('branch'),
    tags: t.exposeStringList('tags'),
    bookmarks: t.exposeStringList('bookmarks'),
    parents: t.exposeStringList('parents'),
    files: t.field({ type: [CommitFileObject], resolve: (c) => c.files }),
    diff: t.field({
      type: 'String',
      nullable: true,
      resolve: async (c) => {
        try {
          return c._vcsKind === 'GIT'
            ? await fetchGitRawDiff(c._owner, c._repoName, c.node)
            : await fetchRawDiff(c._owner, c._repoName, c.node)
        } catch (err) {
          console.error('Failed to fetch commit diff:', err)
          return null
        }
      },
    }),
  }),
})

const BookmarkObject = builder.objectRef<{ name: string; node: string; short_node: string }>('Bookmark').implement({
  fields: (t) => ({
    name: t.exposeString('name'),
    node: t.exposeString('node'),
    short_node: t.exposeString('short_node'),
  }),
})

// --- Directory / file browsing object types ---
// Backed by hgweb's file/raw-file JSON+raw endpoints, not Prisma — see
// repos/hgweb-client.ts. There's no "whole tree" endpoint, so this is
// deliberately one directory level (or one file) per resolve, not a
// recursive structure.

interface RepoDirectoryEntryShape {
  name: string
  path: string
}

interface RepoFileEntryShape {
  name: string
  path: string
  size: number
  // Carried so `last_commit_message`/`last_commit_date` can look up the
  // file's log entry lazily, on demand — only paid for when a query
  // actually selects one of those fields (see `getFileLog` below), not
  // eagerly for every file in the directory regardless of what's asked
  // for.
  _ownerName: string
  _repoName: string
  _rev: string
  _vcsKind: VcsKind
  // Memoizes the (at most one) fetchFileLog call across both fields, in
  // case a query selects both `last_commit_message` and
  // `last_commit_date` — they'd otherwise each trigger their own
  // redundant hgweb/git-browse round-trip for the same file.
  _logPromise?: Promise<HgLogEntry | null>
}

function getFileLog(file: RepoFileEntryShape): Promise<HgLogEntry | null> {
  if (!file._logPromise) {
    file._logPromise =
      file._vcsKind === 'GIT'
        ? fetchGitFileLog(file._ownerName, file._repoName, file._rev, file.path)
        : fetchFileLog(file._ownerName, file._repoName, file._rev, file.path)
  }
  return file._logPromise
}

const RepoDirectoryEntryObject = builder.objectRef<RepoDirectoryEntryShape>('RepoDirectoryEntry').implement({
  fields: (t) => ({
    name: t.exposeString('name'),
    path: t.exposeString('path'),
  }),
})

const RepoFileEntryObject = builder.objectRef<RepoFileEntryShape>('RepoFileEntry').implement({
  fields: (t) => ({
    name: t.exposeString('name'),
    path: t.exposeString('path'),
    size: t.exposeInt('size'),
    last_commit_message: t.field({
      type: 'String',
      nullable: true,
      resolve: async (file) => {
        const log = await getFileLog(file)
        return log?.desc ?? null
      },
    }),
    last_commit_date: t.field({
      type: 'Int',
      nullable: true,
      resolve: async (file) => {
        const log = await getFileLog(file)
        return log ? Math.floor(log.date[0]) : null
      },
    }),
  }),
})

interface RepoDirectoryShape {
  path: string
  directories: RepoDirectoryEntryShape[]
  files: RepoFileEntryShape[]
}

const RepoDirectoryObject = builder.objectRef<RepoDirectoryShape>('RepoDirectory').implement({
  fields: (t) => ({
    path: t.exposeString('path'),
    directories: t.field({ type: [RepoDirectoryEntryObject], resolve: (d) => d.directories }),
    files: t.field({ type: [RepoFileEntryObject], resolve: (d) => d.files }),
  }),
})

interface RepoFileShape {
  path: string
  size: number
  isBinary: boolean
  isTooLarge: boolean
  content: string | null
}

const RepoFileObject = builder.objectRef<RepoFileShape>('RepoFile').implement({
  fields: (t) => ({
    path: t.exposeString('path'),
    size: t.exposeInt('size'),
    isBinary: t.exposeBoolean('isBinary'),
    isTooLarge: t.exposeBoolean('isTooLarge'),
    content: t.exposeString('content', { nullable: true }),
  }),
})

// hgweb's JSON directory listing is inconsistent about leading slashes
// (directories come back as e.g. "/web/bff", files as "web/.prettierignore"
// — confirmed against real hgweb output) — strip a leading slash from
// either so callers always get a clean root-relative path.
const stripLeadingSlash = (p: string) => p.replace(/^\//, '')

const MAX_FILE_SIZE_BYTES = 1_000_000
const BINARY_SNIFF_BYTES = 8_000

// --- Repository object type ---

// Exported so review.ts can add a `review(number)` field onto Repository
// via builder.objectField without repository.ts needing to import anything
// from review.ts in return (that would be a real circular import — this
// keeps the dependency one-directional).
export const RepositoryObject = builder.prismaObject('Repository', {
  name: 'Repository',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    updated_time: exposeTime(t, 'updatedTime'),
    is_deleted: t.exposeBoolean('isDeleted'),
    name: t.exposeString('name'),
    description: t.exposeString('description', { nullable: true }),
    visibility: t.expose('visibility', { type: RepositoryVisibility }),
    vcs_kind: t.expose('vcsKind', { type: VcsKind }),
    owner: t.field({
      type: RepositoryOwner,
      resolve: async (repository, _args, ctx) => {
        if (repository.ownerUserId) {
          const user = await ctx.prisma.modelUser.findUnique({
            where: { id: repository.ownerUserId },
          })
          if (user) {
            return user
          }
        }
        if (repository.ownerOrganizationId) {
          const org = await ctx.prisma.modelOrganization.findUnique({
            where: { id: repository.ownerOrganizationId },
          })
          if (org) {
            return org
          }
        }
        throw new Error('Repository has no owner')
      },
    }),
    admins: t.relatedConnection('admins', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ username: 'asc' }, { id: 'asc' }] }),
    }),
    // Git has no bookmark/branch equivalent exposed yet — these repos
    // structurally have only one ref (`master`) today, so there's nothing
    // meaningful to list. See docs/plans/zesty-zooming-cupcake.md's
    // Non-goals.
    bookmarks: t.field({
      type: [BookmarkObject],
      resolve: async (repository, _args, ctx) => {
        const ownerName = await resolveOwnerName(repository, ctx.prisma)
        await requireRepoReadAccess(ctx.user, ownerName, repository.name)
        if (repository.vcsKind === 'GIT') return []
        const bookmarks = await fetchBookmarks(ownerName, repository.name)
        return bookmarks.map((b) => ({ name: b.bookmark, node: b.node, short_node: b.node.slice(0, 12) }))
      },
    }),
    commits: t.connection(
      {
        type: CommitObject,
        resolve: async (repository, args, ctx) => {
          const ownerName = await resolveOwnerName(repository, ctx.prisma)
          await requireRepoReadAccess(ctx.user, ownerName, repository.name)
          return resolveCursorConnection<Promise<CommitShape[]>>(
            { args, toCursor: (changeset) => changeset.node },
            async ({ after, before: _before, limit, inverted }) => {
              if (inverted) {
                throw new GraphQLError('Paginating commits with `last`/`before` is not supported')
              }
              const changesets =
                repository.vcsKind === 'GIT'
                  ? await fetchGitShortlog(ownerName, repository.name, { after, count: limit })
                  : await fetchShortlog(ownerName, repository.name, { after, count: limit })
              return changesets.map((c) => toCommitShape(ownerName, repository.name, c, repository.vcsKind))
            },
          )
        },
      },
      { name: 'CommitConnection' },
      { name: 'CommitEdge' },
    ),
    commit: t.field({
      type: CommitObject,
      args: { node: t.arg.string({ required: true }) },
      resolve: async (repository, args, ctx) => {
        const ownerName = await resolveOwnerName(repository, ctx.prisma)
        await requireRepoReadAccess(ctx.user, ownerName, repository.name)
        const changeset =
          repository.vcsKind === 'GIT'
            ? await fetchGitChangeset(ownerName, repository.name, args.node)
            : await fetchChangeset(ownerName, repository.name, args.node)
        return toCommitShape(ownerName, repository.name, changeset, repository.vcsKind)
      },
    }),
    directory: t.field({
      type: RepoDirectoryObject,
      nullable: true,
      args: {
        rev: t.arg.string({ required: false, defaultValue: 'tip' }),
        path: t.arg.string({ required: false, defaultValue: '' }),
      },
      resolve: async (repository, args, ctx) => {
        const ownerName = await resolveOwnerName(repository, ctx.prisma)
        await requireRepoReadAccess(ctx.user, ownerName, repository.name)
        const requestedRev = args.rev ?? 'tip'
        // hgweb's "tip" sentinel has no git equivalent — these repos only
        // ever have one ref, so "tip" just means "master" for git.
        const rev = repository.vcsKind === 'GIT' && requestedRev === 'tip' ? 'master' : requestedRev
        const path = args.path ?? ''
        try {
          const listing =
            repository.vcsKind === 'GIT'
              ? await fetchGitDirectory(ownerName, repository.name, rev, path)
              : await fetchDirectory(ownerName, repository.name, rev, path)
          return {
            path,
            directories: listing.directories.map((d) => ({
              name: d.basename,
              path: stripLeadingSlash(d.abspath),
            })),
            files: listing.files.map((f) => ({
              name: f.basename,
              path: stripLeadingSlash(f.abspath),
              size: f.size,
              _ownerName: ownerName,
              _repoName: repository.name,
              _rev: rev,
              _vcsKind: repository.vcsKind,
            })),
          }
        } catch {
          // Most commonly a nonexistent path (stale link, bad URL) — same
          // "just not found" shape as everywhere else, not worth a 500.
          return null
        }
      },
    }),
    file: t.field({
      type: RepoFileObject,
      nullable: true,
      args: {
        rev: t.arg.string({ required: false, defaultValue: 'tip' }),
        path: t.arg.string({ required: true }),
      },
      resolve: async (repository, args, ctx) => {
        const ownerName = await resolveOwnerName(repository, ctx.prisma)
        await requireRepoReadAccess(ctx.user, ownerName, repository.name)
        const requestedRev = args.rev ?? 'tip'
        const rev = repository.vcsKind === 'GIT' && requestedRev === 'tip' ? 'master' : requestedRev
        try {
          const buffer =
            repository.vcsKind === 'GIT'
              ? await fetchGitRawFile(ownerName, repository.name, rev, args.path)
              : await fetchRawFile(ownerName, repository.name, rev, args.path)
          const isBinary = buffer.subarray(0, BINARY_SNIFF_BYTES).includes(0)
          const isTooLarge = buffer.byteLength > MAX_FILE_SIZE_BYTES
          return {
            path: args.path,
            size: buffer.byteLength,
            isBinary,
            isTooLarge,
            content: !isBinary && !isTooLarge ? buffer.toString('utf-8') : null,
          }
        } catch {
          return null
        }
      },
    }),
  }),
})

// --- Repository queries ---

builder.queryField('repository', (t) =>
  t.prismaField({
    type: 'Repository',
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: async (_query, _root, args, ctx) => {
      const repo = await ctx.prisma.repository.findUnique({
        where: { id: BigInt(args.id) },
      })
      if (!repo) {
        return null
      }
      // Same NOT_FOUND-vs-unauthorized masking as
      // repository_by_owner_and_name below — without this, a repo's
      // name/description/visibility were readable by ID by anyone,
      // unauthenticated, regardless of visibility (the nested content
      // fields like `directory`/`commits` each already check access
      // independently, so this was a metadata-only leak, but a real one).
      const ownerName = await resolveOwnerName(repo, ctx.prisma)
      const allowed = await canAccessRepo(ctx.user, ownerName, repo.name, 'read')
      return allowed ? repo : null
    },
  }),
)

builder.queryField('repository_by_owner_and_name', (t) =>
  t.prismaField({
    type: 'Repository',
    nullable: true,
    args: {
      owner_username: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const user = await ctx.prisma.modelUser.findUnique({
        where: { username: args.owner_username },
        select: { id: true },
      })
      let repo
      if (user) {
        repo = await ctx.prisma.repository.findUnique({
          where: {
            ownerUserId_name: { ownerUserId: user.id, name: args.name },
          },
        })
      } else {
        const org = await ctx.prisma.modelOrganization.findUnique({
          where: { name: args.owner_username },
          select: { id: true },
        })
        repo = org
          ? await ctx.prisma.repository.findUnique({
              where: {
                ownerOrganizationId_name: { ownerOrganizationId: org.id, name: args.name },
              },
            })
          : null
      }
      if (!repo) {
        return null
      }
      // Same NOT_FOUND-vs-unauthorized masking as requireRepoReadAccess, but
      // returning null instead of throwing — this field is nullable and
      // every caller already treats null as "not found", so a private repo
      // a caller can't read should look exactly like one that doesn't
      // exist, not surface a GraphQL error.
      const allowed = await canAccessRepo(ctx.user, args.owner_username, args.name, 'read')
      return allowed ? repo : null
    },
  }),
)

// --- Repository mutations ---

builder.mutationField('create_repository', (t) =>
  t.prismaField({
    type: 'Repository',
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: false }),
      visibility: t.arg({ type: RepositoryVisibility, required: true }),
      // Git is the default going forward — hg is being phased out (see
      // docs/plans/zesty-zooming-cupcake.md). A caller that omits this arg
      // entirely gets GIT, not HG.
      kind: t.arg({ type: VcsKind, required: false, defaultValue: 'GIT' }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const user = requireUser(ctx.user)
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(args.name)) {
        throw new GraphQLError('Invalid repository name')
      }
      const kind = args.kind ?? 'GIT'

      let repo
      try {
        repo = await ctx.prisma.repository.create({
          data: {
            name: args.name,
            description: args.description,
            visibility: args.visibility,
            vcsKind: kind,
            ownerUserId: user.id,
          },
        })
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new GraphQLError('You already have a repository with this name')
        }
        throw err
      }

      try {
        // Enqueues a provision-repo job, claimed and executed by whichever
        // environment's VM worker stack polls this BFF (see
        // jobs/provision-repo.ts and pothos/schema/hg-worker.ts, or the
        // git-kind counterparts) — the same job path for both local dev and
        // prod now, no more HG_LOCAL_REPOS_DIR branch. Waits for completion
        // so this mutation still only returns once the repo actually exists
        // on disk.
        if (kind === 'GIT') {
          await enqueueProvisionGitRepo(user.username, args.name)
        } else {
          await enqueueProvisionRepo(user.username, args.name)
        }
      } catch (err) {
        // Compensating rollback — don't leave a Repository row with no
        // matching on-disk repo.
        await ctx.prisma.repository.delete({ where: { id: repo.id } })
        // GraphQLError's `originalError` option would re-trigger yoga's
        // masking (it re-evaluates based on the wrapped error) — log
        // server-side instead, and throw a plain client-facing message.
        console.error('VM repo provisioning failed:', err)
        throw new GraphQLError('Failed to provision repository, please try again')
      }

      return repo
    },
  }),
)

builder.mutationField('update_repository_visibility', (t) =>
  t.prismaField({
    type: 'Repository',
    args: {
      id: t.arg.id({ required: true }),
      visibility: t.arg({ type: RepositoryVisibility, required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const user = requireUser(ctx.user)
      const repo = await requireOwnedRepo(user, ctx.prisma, BigInt(args.id))
      return ctx.prisma.repository.update({
        where: { id: repo.id },
        data: { visibility: args.visibility },
      })
    },
  }),
)

builder.mutationField('delete_repository', (t) =>
  t.boolean({
    args: { id: t.arg.id({ required: true }) },
    resolve: async (_root, args, ctx) => {
      const user = requireUser(ctx.user)
      const repo = await requireOwnedRepo(user, ctx.prisma, BigInt(args.id))
      const ownerName = await resolveOwnerName(repo, ctx.prisma)

      // On-disk before Postgres, deliberately: if this throws, the
      // Postgres row is left untouched, so a failure leaves a repo that's
      // still visible and retryable rather than a row silently vanishing
      // while its data survives, unreachable, on disk. Same job-queue path
      // as create_repository — see jobs/delete-repo.ts / delete-git-repo.ts.
      if (repo.vcsKind === 'GIT') {
        await enqueueDeleteGitRepo(ownerName, repo.name)
      } else {
        await enqueueDeleteRepo(ownerName, repo.name)
      }

      await ctx.prisma.repository.delete({ where: { id: repo.id } })
      return true
    },
  }),
)

builder.queryField('owner_by_name', (t) =>
  t.field({
    type: RepositoryOwner,
    nullable: true,
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const user = await ctx.prisma.modelUser.findUnique({
        where: { username: args.name },
      })
      if (user) {
        return user
      }
      const org = await ctx.prisma.modelOrganization.findUnique({
        where: { name: args.name },
      })
      if (org) {
        return org
      }
      return null
    },
  }),
)
