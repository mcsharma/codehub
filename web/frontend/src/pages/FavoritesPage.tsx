import { graphql, usePreloadedQuery, useMutation } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { FavoritesPageQuery } from './__generated__/FavoritesPageQuery.graphql'
import type { FavoritesPageToggleFavoriteMutation } from './__generated__/FavoritesPageToggleFavoriteMutation.graphql'

import { Heart } from 'lucide-react'
import { Alert, AlertDescription } from '../components/ui/alert'
import StatusBadge from '../components/StatusBadge'
import { formatRelativeTime } from '../utils/formatters'
import { cn } from '@/lib/utils'

// Demonstrates reading through the `Favorite` join model (rather than a
// plain Book<->User many-to-many) — each edge carries its own
// `created_time` ("favorited at"), which a plain implicit relation
// couldn't expose. See ModelUser.favorites in
// web/bff/src/pothos/schema/user.ts.
const FavoritesPage = () => {
  const { favoritesQueryRef } = useLoaderData() as {
    favoritesQueryRef: PreloadedQuery<FavoritesPageQuery>
  }

  const data = usePreloadedQuery<FavoritesPageQuery>(
    graphql`
      query FavoritesPageQuery {
        current_user {
          username
          favorites(first: 50) {
            edges {
              node {
                id
                created_time
                book {
                  id
                  title
                  publisher {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
    favoritesQueryRef,
  )

  const [commitToggle] = useMutation<FavoritesPageToggleFavoriteMutation>(graphql`
    mutation FavoritesPageToggleFavoriteMutation($book_id: ID!) {
      toggle_favorite_book(book_id: $book_id) {
        id
        is_favorited
      }
    }
  `)

  if (!data.current_user) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-8">
        <Alert variant="warning">
          <AlertDescription>You need to be logged in to see your favorites.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const favorites = (data.current_user.favorites?.edges ?? []).map((edge) => edge?.node).filter((node) => !!node)

  return (
    <div className="mx-auto max-w-[700px] px-4 py-12">
      <h1 className="mb-8 text-[2.125rem] font-bold">Your favorites</h1>

      {favorites.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing favorited yet — head to the <Link to="/">book list</Link> and tap the heart on something you like.
        </p>
      ) : (
        <div className="rounded-[4px] border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
          {favorites.map((favorite, index) => (
            <div key={favorite.id} className={cn(index > 0 && 'border-t border-border')}>
              <div className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <Link to={`/books/${favorite.book?.id}`} className="font-bold text-foreground no-underline hover:underline">
                    {favorite.book?.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-3">
                    <StatusBadge label={favorite.book?.publisher?.name ?? 'Unknown publisher'} tone="neutral" />
                    <span className="text-xs text-muted-foreground">
                      Favorited {formatRelativeTime(favorite.created_time ?? 0)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Unfavorite"
                  onClick={() => commitToggle({ variables: { book_id: favorite.book?.id ?? '' } })}
                  className="shrink-0 text-destructive"
                >
                  <Heart className="size-5 fill-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
