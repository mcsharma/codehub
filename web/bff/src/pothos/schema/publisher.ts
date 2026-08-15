import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'
import { requireUser } from '../require-user.js'

// --- Publisher object type ---

export const PublisherObject = builder.prismaObject('Publisher', {
  name: 'Publisher',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    name: t.exposeString('name'),
    books: t.relation('books'),
  }),
})

// --- Queries ---

// Plain list, not a connection — fine for a small lookup-style table like
// this. Contrast with Book.books below, which uses a real paginated
// connection since a book catalog can grow large.
builder.queryField('publishers', (t) =>
  t.prismaField({
    type: ['Publisher'],
    resolve: (_query, _root, _args, ctx) =>
      ctx.prisma.publisher.findMany({ orderBy: { name: 'asc' } }),
  }),
)

builder.queryField('publisher', (t) =>
  t.prismaField({
    type: 'Publisher',
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: (_query, _root, args, ctx) =>
      ctx.prisma.publisher.findUnique({ where: { id: BigInt(args.id) } }),
  }),
)

// --- Mutations ---

builder.mutationField('create_publisher', (t) =>
  t.prismaField({
    type: 'Publisher',
    args: { name: t.arg.string({ required: true }) },
    resolve: (_query, _root, args, ctx) => {
      requireUser(ctx.user)
      return ctx.prisma.publisher.create({ data: { name: args.name } })
    },
  }),
)
