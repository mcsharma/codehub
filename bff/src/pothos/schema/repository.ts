import { builder } from '@bff/pothos/builder.js'
import { exposeID, exposeTime } from '@bff/pothos/field-exposers.js'
import { RepositoryVisibility } from '@prisma/client'
import { UserObject } from './user.js'
import { OrganizationObject } from './organization.js'

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
    commits: t.relatedConnection('commits', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ createdTime: 'desc' }, { id: 'desc' }] }),
    }),
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
      const owner = await ctx.prisma.modelUser.findUnique({
        where: { username: args.owner_username },
        select: { id: true },
      })
      if (!owner) {
        return null
      }
      return ctx.prisma.repository.findUnique({
        where: {
          ownerUserId_name: { ownerUserId: owner.id, name: args.name },
        },
      })
    },
  }),
)
