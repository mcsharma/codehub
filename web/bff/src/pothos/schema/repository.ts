import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'
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
