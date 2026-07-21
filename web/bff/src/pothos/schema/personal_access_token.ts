import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'
import { requireUser } from '../require-user.js'
import { createPersonalAccessToken } from '../../auth/personal-access-token.js'

// --- PersonalAccessToken object type ---
// Never exposes `tokenHash` or the raw token — the raw value is only ever
// returned once, from the create mutation below.

builder.prismaObject('PersonalAccessToken', {
  name: 'PersonalAccessToken',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    last_used_time: t.int({
      nullable: true,
      resolve: (parent) =>
        parent.lastUsedTime ? Math.floor(parent.lastUsedTime.getTime() / 1000) : null,
    }),
    label: t.exposeString('label'),
  }),
})

// --- Queries ---

builder.queryField('my_personal_access_tokens', (t) =>
  t.prismaField({
    type: ['PersonalAccessToken'],
    resolve: (_query, _root, _args, ctx) => {
      if (!ctx.user) return []
      return ctx.prisma.personalAccessToken.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdTime: 'desc' },
      })
    },
  }),
)

// --- Mutations ---

const CreatePersonalAccessTokenResult = builder
  .objectRef<{ id: string; label: string; token: string }>('CreatePersonalAccessTokenResult')
  .implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      label: t.exposeString('label'),
      token: t.exposeString('token'),
    }),
  })

builder.mutationField('create_personal_access_token', (t) =>
  t.field({
    type: CreatePersonalAccessTokenResult,
    args: { label: t.arg.string({ required: true }) },
    resolve: async (_root, args, ctx) => {
      const user = requireUser(ctx.user)
      const { id, rawToken } = await createPersonalAccessToken(user.id, args.label)
      return { id: String(id), label: args.label, token: rawToken }
    },
  }),
)

builder.mutationField('revoke_personal_access_token', (t) =>
  t.boolean({
    args: { id: t.arg.id({ required: true }) },
    resolve: async (_root, args, ctx) => {
      const user = requireUser(ctx.user)
      const { count } = await ctx.prisma.personalAccessToken.deleteMany({
        where: { id: BigInt(args.id), userId: user.id },
      })
      return count > 0
    },
  }),
)
