import { graphql, usePreloadedQuery, useMutation } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { BooksListPageQuery } from './__generated__/BooksListPageQuery.graphql'
import type { BooksListPageToggleFavoriteMutation } from './__generated__/BooksListPageToggleFavoriteMutation.graphql'

import { Heart, Plus } from 'lucide-react'
import { Button } from '../components/ui/button'
import StatusBadge from '../components/StatusBadge'

// A public, paginated list of every book in the catalog — the `books`
// field is a real Pothos-Prisma `t.prismaConnection` (see
// web/bff/src/pothos/schema/book.ts), so this is the idiomatic
// first/after Relay pagination shape. Kept to a single fixed page for a
// minimal example rather than wiring up a "load more" button.
const BooksListPage = () => {
  const { booksQueryRef } = useLoaderData() as {
    booksQueryRef: PreloadedQuery<BooksListPageQuery>
  }

  const data = usePreloadedQuery<BooksListPageQuery>(
    graphql`
      query BooksListPageQuery {
        current_user {
          username
        }
        books(first: 20) {
          edges {
            node {
              id
              title
              publication_year
              is_favorited
              publisher {
                name
              }
              authors {
                id
                name
              }
            }
          }
        }
      }
    `,
    booksQueryRef,
  )

  const [commitToggle] = useMutation<BooksListPageToggleFavoriteMutation>(graphql`
    mutation BooksListPageToggleFavoriteMutation($book_id: ID!) {
      toggle_favorite_book(book_id: $book_id) {
        id
        is_favorited
      }
    }
  `)

  const isLoggedIn = !!data.current_user
  const books = (data.books?.edges ?? []).map((edge) => edge?.node).filter((node) => !!node)

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[2.125rem] font-bold">Books</h1>
          <p className="mt-1 text-muted-foreground">A small catalog — publishers, authors, and books.</p>
        </div>
        {isLoggedIn && (
          <Button render={<Link to="/books/new" />}>
            <Plus className="size-4" />
            New Book
          </Button>
        )}
      </div>

      {books.length === 0 ? (
        <p className="text-muted-foreground">No books yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex flex-col rounded-[4px] border border-border bg-card p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <Link to={`/books/${book.id}`} className="font-bold text-foreground no-underline hover:underline">
                  {book.title}
                </Link>
                {isLoggedIn && (
                  <button
                    type="button"
                    aria-label={book.is_favorited ? 'Unfavorite' : 'Favorite'}
                    onClick={() =>
                      commitToggle({
                        variables: { book_id: book.id ?? '' },
                        optimisticResponse: {
                          toggle_favorite_book: { id: book.id ?? '', is_favorited: !book.is_favorited },
                        },
                      })
                    }
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Heart className={book.is_favorited ? 'size-5 fill-destructive text-destructive' : 'size-5'} />
                  </button>
                )}
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                {(book.authors ?? []).map((a) => a.name).join(', ') || 'Unknown author'}
                {book.publication_year ? ` · ${book.publication_year}` : ''}
              </p>
              <div>
                <StatusBadge label={book.publisher?.name ?? 'Unknown publisher'} tone="neutral" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BooksListPage
