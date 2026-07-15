import { builder } from '@bff/pothos/builder.js'
import { exposeID, exposeTime } from '@bff/pothos/field-exposers.js'

// --- Organization object type ---

export const OrganizationObject = builder.prismaObject('ModelOrganization', {
  name: 'Organization',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    updated_time: exposeTime(t, 'updatedTime'),
    is_deleted: t.exposeBoolean('isDeleted'),
    name: t.exposeString('name'),
    data: t.string({
      resolve: (parent) =>
        typeof parent.data === 'string'
          ? parent.data
          : JSON.stringify(parent.data),
    }),
    repositories: t.relatedConnection('repositories', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ createdTime: 'desc' }, { id: 'desc' }] }),
    }),
    admins: t.relatedConnection('admins', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ username: 'asc' }, { id: 'asc' }] }),
    }),
  }),
})

// --- Organization queries ---

builder.queryField('organization', (t) =>
  t.prismaField({
    type: 'ModelOrganization',
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: async (_query, _root, args, ctx) =>
      ctx.prisma.modelOrganization.findUnique({
        where: { id: BigInt(args.id) },
      }),
  }),
)

builder.queryField('organization_by_name', (t) =>
  t.prismaField({
    type: 'ModelOrganization',
    nullable: true,
    args: { name: t.arg.string({ required: true }) },
    resolve: async (_query, _root, args, ctx) =>
      ctx.prisma.modelOrganization.findUnique({
        where: { name: args.name },
      }),
  }),
)
