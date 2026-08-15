import { graphql, usePreloadedQuery, useMutation } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { BookPageQuery } from './__generated__/BookPageQuery.graphql'
import type { BookPageToggleFavoriteMutation } from './__generated__/BookPageToggleFavoriteMutation.graphql'

import { ChevronLeft, Heart } from 'lucide-react'
import { Button } from '../components/ui/button'
import StatusBadge from '../components/StatusBadge'

const BookPage = () => {
  const { bookQueryRef } = useLoaderData() as {
    bookQueryRef: PreloadedQuery<BookPageQuery>
  }

  const data = usePreloadedQuery<BookPageQuery>(
    graphql`
      query BookPageQuery($id: ID!) {
        current_user {
          username
        }
        book(id: $id) {
          id
          title
          publication_year
          is_favorited
          publisher {
            id
            name
          }
          authors {
            id
            name
            bio
          }
        }
      }
    `,
    bookQueryRef,
  )

  const [commitToggle, isToggling] = useMutation<BookPageToggleFavoriteMutation>(graphql`
    mutation BookPageToggleFavoriteMutation($book_id: ID!) {
      toggle_favorite_book(book_id: $book_id) {
        id
        is_favorited
      }
    }
  `)

  const book = data.book

  if (!book) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-12">
        <p className="text-muted-foreground">Book not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[700px] px-4 py-12">
      <Button variant="ghost" render={<Link to="/" />} className="mb-6">
        <ChevronLeft className="size-4" />
        Back to books
      </Button>

      <div className="rounded-[4px] border border-border bg-card p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{book.title}</h1>
            {book.publication_year && (
              <p className="mt-1 text-muted-foreground">Published {book.publication_year}</p>
            )}
          </div>
          {data.current_user && (
            <Button
              variant="outline"
              disabled={isToggling}
              onClick={() => commitToggle({ variables: { book_id: book.id ?? '' } })}
            >
              <Heart className={book.is_favorited ? 'size-4 fill-destructive text-destructive' : 'size-4'} />
              {book.is_favorited ? 'Favorited' : 'Favorite'}
            </Button>
          )}
        </div>

        <div className="mb-6">
          <StatusBadge label={book.publisher?.name ?? 'Unknown publisher'} tone="neutral" />
        </div>

        <div>
          <p className="mb-3 font-bold">Authors</p>
          <div className="flex flex-col gap-4">
            {(book.authors ?? []).map((author) => (
              <div key={author.id}>
                <p className="font-bold">{author.name}</p>
                {author.bio && <p className="text-sm text-muted-foreground">{author.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookPage
