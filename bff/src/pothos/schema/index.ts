import { builder } from '@bff/pothos/builder.js'
import { exposeID, exposeTime } from '@bff/pothos/field-exposers.js'

// --- Prisma object types (snake_case field names) ---

builder.prismaObject('ModelUser', {
  name: 'User',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    updated_time: exposeTime(t, 'updatedTime'),
    is_deleted: t.exposeBoolean('isDeleted'),
    username: t.exposeString('username'),
    data: t.string({
      resolve: (parent) =>
        typeof parent.data === 'string'
          ? parent.data
          : JSON.stringify(parent.data),
    }),
    owned_repositories: t.relatedConnection('ownedRepositories', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ createdTime: 'desc' }, { id: 'desc' }] }),
    }),
    collaborated_repositories: t.relatedConnection('collaboratedRepositories', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ createdTime: 'desc' }, { id: 'desc' }] }),
    }),
    commits_authored: t.relatedConnection('commitsAuthored', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ createdTime: 'desc' }, { id: 'desc' }] }),
    }),
  }),
})

builder.prismaObject('Repository', {
  name: 'Repository',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    updated_time: exposeTime(t, 'updatedTime'),
    is_deleted: t.exposeBoolean('isDeleted'),
    name: t.exposeString('name'),
    private: t.exposeBoolean('private'),
    owner: t.relation('owner'),
    collaborators: t.relatedConnection('collaborators', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ username: 'asc' }, { id: 'asc' }] }),
    }),
    commits: t.relatedConnection('commits', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ createdTime: 'desc' }, { id: 'desc' }] }),
    }),
  }),
})

builder.prismaObject('Commit', {
  name: 'Commit',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    sha: t.exposeString('sha'),
    message: t.exposeString('message', { nullable: true }),
    repository: t.relation('repository'),
    author: t.relation('author'),
  }),
})

// --- Queries (snake_case) ---

builder.queryField('user', (t) =>
  t.prismaField({
    type: 'ModelUser',
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: async (_query, _root, args, ctx) =>
      ctx.prisma.modelUser.findUnique({
        where: { id: BigInt(args.id) },
      }),
  }),
)

builder.queryField('user_by_username', (t) =>
  t.prismaField({
    type: 'ModelUser',
    nullable: true,
    args: { username: t.arg.string({ required: true }) },
    resolve: async (_query, _root, args, ctx) =>
      ctx.prisma.modelUser.findUnique({
        where: { username: args.username },
      }),
  }),
)

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
      const owner = await ctx.prisma.modelUser.findUnique({
        where: { username: args.owner_username },
        select: { id: true },
      })
      if (!owner) return null
      return ctx.prisma.repository.findUnique({
        where: {
          ownerId_name: { ownerId: owner.id, name: args.name },
        },
      })
    },
  }),
)

builder.mutationField('noop', (t) =>
  t.boolean({
    resolve: () => true,
    description: 'No-op mutation for schema compatibility (e.g. Relay).',
  }),
)
