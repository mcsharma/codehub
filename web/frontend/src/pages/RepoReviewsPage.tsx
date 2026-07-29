import { graphql, usePreloadedQuery } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { RepoReviewsPageQuery } from './__generated__/RepoReviewsPageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'

import RepoHeader from '../components/RepoHeader'
import RepoNotFound from '../components/RepoNotFound'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import UserAvatar from '../components/UserAvatar'
import { resolveOwnerName } from '../utils/repoOwner'
import { formatRelativeTime } from '../utils/formatters'

// A plain list, not paginated — matches the backing `Repository.reviews`
// field (see web/bff/src/pothos/schema/review.ts), which is deliberately
// a simple list for the same v1-scope reasons.
function statusBadgeVariant(status: string): 'info' | 'warning' | 'success' | 'danger' | 'secondary' {
  switch (status) {
    case 'OPEN':
      return 'info'
    case 'LANDING':
      return 'warning'
    case 'LANDED':
      return 'success'
    case 'LAND_FAILED':
      return 'danger'
    default:
      return 'secondary'
  }
}

const RepoReviewsPage = () => {
  const { repoReviewsQueryRef } = useLoaderData() as {
    repoReviewsQueryRef: PreloadedQuery<RepoReviewsPageQuery>
  }

  const data = usePreloadedQuery<RepoReviewsPageQuery>(
    graphql`
      query RepoReviewsPageQuery($owner_username: String!, $name: String!) {
        current_user {
          username
        }
        repository_by_owner_and_name(owner_username: $owner_username, name: $name) {
          name
          visibility
          owner {
            __typename
            ... on User {
              username
            }
            ... on Organization {
              name
            }
          }
          reviews {
            number
            title
            status
            created_time
            author {
              username
            }
          }
        }
      }
    `,
    repoReviewsQueryRef,
  )

  const repository = data.repository_by_owner_and_name
  const { owner_username, name: repoName } = repoReviewsQueryRef.variables

  if (!repository) {
    return <RepoNotFound ownerUsername={owner_username} repoName={repoName} />
  }

  const ownerName = resolveOwnerName(repository.owner, owner_username)
  const isOwner = data.current_user?.username === ownerName
  const reviews = repository.reviews ?? []

  return (
    <div>
      <RepoHeader
        ownerUsername={ownerName}
        repoName={repository.name ?? repoName}
        visibility={repository.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
        isOwner={isOwner}
      />
      <div className="bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-10">
          {reviews.length === 0 ? (
            <p className="py-8 text-muted-foreground">
              No reviews yet — submit one with{' '}
              <code className="rounded-[4px] bg-secondary px-1.5 py-0.5 font-mono text-sm">ch submit</code>.
            </p>
          ) : (
            <div className="rounded-[4px] border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
              {reviews.map((review, index) => (
                <div key={review.number}>
                  {index > 0 && <Separator />}
                  <Link
                    to={`/${ownerName}/${repository.name ?? repoName}/d/${review.number}`}
                    className="flex items-start gap-4 p-5 text-foreground no-underline hover:bg-background"
                  >
                    <UserAvatar />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 font-mono text-xs text-primary">
                            D{review.number}
                          </span>
                          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold">
                            {review.title}
                          </p>
                        </div>
                        <Badge variant={statusBadgeVariant(review.status ?? 'OPEN')} className="shrink-0">
                          {review.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs font-bold">{review.author?.username}</span>
                        <span className="text-xs text-muted-foreground">
                          opened {formatRelativeTime(review.created_time ?? 0)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RepoReviewsPage
