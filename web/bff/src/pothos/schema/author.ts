import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'

// --- Author object type ---

export const AuthorObject = builder.prismaObject('Author', {
  name: 'Author',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    name: t.exposeString('name'),
    bio: t.exposeString('bio', { nullable: true }),
    books: t.relation('books'),
  }),
})

// --- Queries ---

builder.queryField('authors', (t) =>
  t.prismaField({
    type: ['Author'],
    resolve: (_query, _root, _args, ctx) =>
      ctx.prisma.author.findMany({ orderBy: { name: 'asc' } }),
  }),
)

builder.queryField('author', (t) =>
  t.prismaField({
    type: 'Author',
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: (_query, _root, args, ctx) =>
      ctx.prisma.author.findUnique({ where: { id: BigInt(args.id) } }),
  }),
)

// --- Mutations ---

builder.mutationField('create_author', (t) =>
  t.prismaField({
    type: 'Author',
    args: {
      name: t.arg.string({ required: true }),
      bio: t.arg.string({ required: false }),
    },
    resolve: (_query, _root, args, ctx) =>
      ctx.prisma.author.create({ data: { name: args.name, bio: args.bio ?? null } }),
  }),
)
