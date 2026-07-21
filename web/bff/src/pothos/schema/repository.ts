import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'
import { requireUser } from '../require-user.js'
import { RepositoryVisibility, Prisma } from '@prisma/client'
import type { ModelUser } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { UserObject } from './user.js'
import { OrganizationObject } from './organization.js'
import { provisionRepoOnVm } from '../../repos/provision-on-vm.js'
import { fetchBookmarks, fetchShortlog } from '../../repos/hgweb-client.js'
import { canAccessRepo } from '../../auth/repo-access.js'
import { resolveCursorConnection } from '@pothos/plugin-relay'
import type { prisma } from '../../prisma/db.js'

// --- Shared helpers for the hgweb-backed fields below ---

async function resolveOwnerName(
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
async function requireRepoReadAccess(user: ModelUser | null, ownerName: string, repoName: string): Promise<void> {
  const allowed = await canAccessRepo(user, ownerName, repoName, 'read')
  if (!allowed) {
    throw new GraphQLError('Repository not found', { extensions: { code: 'NOT_FOUND' } })
  }
}

// --- Enums ---

builder.enumType(RepositoryVisibility, {
  name: 'RepositoryVisibility',
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

interface CommitShape {
  node: string
  short_node: string
  author: string
  date: number
  description: string
  branch: string
  tags: string[]
  bookmarks: string[]
}

const CommitObject = builder.objectRef<CommitShape>('Commit').implement({
  fields: (t) => ({
    node: t.exposeString('node'),
    short_node: t.exposeString('short_node'),
    author: t.exposeString('author'),
    date: t.exposeInt('date'),
    description: t.exposeString('description'),
    branch: t.exposeString('branch'),
    tags: t.exposeStringList('tags'),
    bookmarks: t.exposeStringList('bookmarks'),
  }),
})

const BookmarkObject = builder.objectRef<{ name: string; node: string; short_node: string }>('Bookmark').implement({
  fields: (t) => ({
    name: t.exposeString('name'),
    node: t.exposeString('node'),
    short_node: t.exposeString('short_node'),
  }),
})

// --- Repository object type ---

builder.prismaObject('Repository', {
  name: 'Repository',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    updated_time: exposeTime(t, 'updatedTime'),
    is_deleted: t.exposeBoolean('isDeleted'),
    name: t.exposeString('name'),
    visibility: t.expose('visibility', { type: RepositoryVisibility }),
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
    bookmarks: t.field({
      type: [BookmarkObject],
      resolve: async (repository, _args, ctx) => {
        const ownerName = await resolveOwnerName(repository, ctx.prisma)
        await requireRepoReadAccess(ctx.user, ownerName, repository.name)
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
              const changesets = await fetchShortlog(ownerName, repository.name, { after, count: limit })
              return changesets.map((c) => ({
                node: c.node,
                short_node: c.node.slice(0, 12),
                author: c.user,
                date: Math.floor(c.date[0]),
                description: c.desc,
                branch: c.branch,
                tags: c.tags,
                bookmarks: c.bookmarks,
              }))
            },
          )
        },
      },
      { name: 'CommitConnection' },
      { name: 'CommitEdge' },
    ),
  }),
})

// --- Repository queries ---

builder.queryField('repository', (t) =>
  t.prismaField({
    type: 'Repository',
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: async (_query, _root, args, ctx) =>
      ctx.prisma.repository.findUnique({
        where: { id: BigInt(args.id) },
      }),
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
      if (user) {
        return ctx.prisma.repository.findUnique({
          where: {
            ownerUserId_name: { ownerUserId: user.id, name: args.name },
          },
        })
      }
      const org = await ctx.prisma.modelOrganization.findUnique({
        where: { name: args.owner_username },
        select: { id: true },
      })
      if (org) {
        return ctx.prisma.repository.findUnique({
          where: {
            ownerOrganizationId_name: { ownerOrganizationId: org.id, name: args.name },
          },
        })
      }
      return null
    },
  }),
)

// --- Repository mutations ---

builder.mutationField('create_repository', (t) =>
  t.prismaField({
    type: 'Repository',
    args: {
      name: t.arg.string({ required: true }),
      visibility: t.arg({ type: RepositoryVisibility, required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const user = requireUser(ctx.user)
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(args.name)) {
        throw new GraphQLError('Invalid repository name')
      }

      let repo
      try {
        repo = await ctx.prisma.repository.create({
          data: {
            name: args.name,
            visibility: args.visibility,
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
        await provisionRepoOnVm(user.username, args.name)
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
