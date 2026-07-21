import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'
import { requireUser } from '../require-user.js'
import { RepositoryVisibility, Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { UserObject } from './user.js'
import { OrganizationObject } from './organization.js'
import { provisionRepoOnVm } from '../../repos/provision-on-vm.js'

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
