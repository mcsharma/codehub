import { builder } from '../builder.js'
import { exposeID, exposeTime } from '../field-exposers.js'
import { requireUser } from '../require-user.js'
import { GraphQLError } from 'graphql'

// Anti-spam cap for public deployments — not a product decision about how
// many books someone "should" own, just a ceiling so an open, unauthed-signup
// instance can't get its catalog flooded. Seeded books are exempt (they have
// no `addedByUserId` at all, see schema.prisma), only mutation-added
// ones count.
const MAX_BOOKS_PER_USER = 3

// --- Favorite object type ---
// Exposes the join row itself (not just the Book) so `created_time` — i.e.
// "favorited at" — is available for ordering/display on the favorites
// list, which a plain Book<->User implicit many-to-many couldn't carry.

export const FavoriteObject = builder.prismaObject('Favorite', {
  name: 'Favorite',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    book: t.relation('book'),
  }),
})

// --- Book object type ---

export const BookObject = builder.prismaObject('Book', {
  name: 'Book',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    title: t.exposeString('title'),
    publication_year: t.exposeInt('publicationYear', { nullable: true }),
    publisher: t.relation('publisher'),
    authors: t.relation('authors'),
    added_by: t.relation('addedBy', { nullable: true }),
    is_favorited: t.boolean({
      resolve: async (book, _args, ctx) => {
        if (!ctx.user) return false
        const favorite = await ctx.prisma.favorite.findUnique({
          where: { userId_bookId: { userId: ctx.user.id, bookId: book.id } },
        })
        return favorite !== null
      },
    }),
  }),
})

// --- Queries ---

// A real paginated connection (unlike Publisher/Author's plain lists) —
// the standard Pothos-Prisma `t.prismaConnection` helper handles the
// cursor/edges/pageInfo plumbing itself from a plain `findMany`.
builder.queryField('books', (t) =>
  t.prismaConnection({
    type: 'Book',
    cursor: 'id',
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.book.findMany({ ...query, orderBy: { createdTime: 'desc' } }),
  }),
)

builder.queryField('book', (t) =>
  t.prismaField({
    type: 'Book',
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: (_query, _root, args, ctx) =>
      ctx.prisma.book.findUnique({ where: { id: BigInt(args.id) } }),
  }),
)

// --- Mutations ---

builder.mutationField('create_book', (t) =>
  t.prismaField({
    type: 'Book',
    args: {
      title: t.arg.string({ required: true }),
      publication_year: t.arg.int({ required: false }),
      publisher_id: t.arg.id({ required: true }),
      author_ids: t.arg.idList({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const user = requireUser(ctx.user)

      const addedCount = await ctx.prisma.book.count({ where: { addedByUserId: user.id } })
      if (addedCount >= MAX_BOOKS_PER_USER) {
        throw new GraphQLError(`You can only add up to ${MAX_BOOKS_PER_USER} books`, {
          extensions: { code: 'LIMIT_REACHED' },
        })
      }

      return ctx.prisma.book.create({
        data: {
          title: args.title,
          publicationYear: args.publication_year ?? null,
          publisher: { connect: { id: BigInt(args.publisher_id) } },
          authors: { connect: args.author_ids.map((id) => ({ id: BigInt(id) })) },
          addedBy: { connect: { id: user.id } },
        },
      })
    },
  }),
)

builder.mutationField('toggle_favorite_book', (t) =>
  t.prismaField({
    type: 'Book',
    args: { book_id: t.arg.id({ required: true }) },
    resolve: async (_query, _root, args, ctx) => {
      const user = requireUser(ctx.user)
      const bookId = BigInt(args.book_id)
      const existing = await ctx.prisma.favorite.findUnique({
        where: { userId_bookId: { userId: user.id, bookId } },
      })
      if (existing) {
        await ctx.prisma.favorite.delete({ where: { id: existing.id } })
      } else {
        await ctx.prisma.favorite.create({ data: { userId: user.id, bookId } })
      }
      return ctx.prisma.book.findUniqueOrThrow({ where: { id: bookId } })
    },
  }),
)
