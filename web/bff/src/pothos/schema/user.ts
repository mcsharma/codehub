import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'
import { clearSessionCookie } from '../../auth/session.js'

// --- User object type ---

export const UserObject = builder.prismaObject('ModelUser', {
  name: 'User',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    updated_time: exposeTime(t, 'updatedTime'),
    is_deleted: t.exposeBoolean('isDeleted'),
    username: t.exposeString('username'),
    primary_email: t.exposeString('primaryEmail'),
    first_name: t.string({
      nullable: true,
      resolve: (parent) => {
        const data =
          typeof parent.data === 'string'
            ? JSON.parse(parent.data)
            : parent.data
        return (
          ((data as Record<string, unknown>).first_name as
            | string
            | undefined) ?? null
        )
      },
    }),
    last_name: t.string({
      nullable: true,
      resolve: (parent) => {
        const data =
          typeof parent.data === 'string'
            ? JSON.parse(parent.data)
            : parent.data
        return (
          ((data as Record<string, unknown>).last_name as string | undefined) ??
          null
        )
      },
    }),
    // The books this user has favorited, most-recently-favorited first —
    // returns Favorite (not Book) so `created_time` ("favorited at") is
    // available; each edge's `book` field has the actual Book.
    favorites: t.relatedConnection('favorites', {
      cursor: 'id',
      totalCount: true,
      query: () => ({ orderBy: [{ createdTime: 'desc' }, { id: 'desc' }] }),
    }),
  }),
})

// --- User queries ---

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

builder.queryField('current_user', (t) =>
  t.prismaField({
    type: 'ModelUser',
    nullable: true,
    resolve: (_query, _root, _args, ctx) => ctx.user,
  }),
)

// --- Auth mutations ---

builder.mutationField('logout', (t) =>
  t.boolean({
    resolve: async (_root, _args, ctx) => {
      if (ctx.session) {
        await ctx.prisma.session
          .delete({ where: { id: ctx.session.id } })
          .catch(() => {})
      }
      clearSessionCookie(ctx.res)
      return true
    },
  }),
)
