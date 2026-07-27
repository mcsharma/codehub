import { graphql, usePaginationFragment } from 'react-relay'
import { Link } from 'react-router'
import type { RepoCommitsList_query$key } from './__generated__/RepoCommitsList_query.graphql'

import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import UserAvatar from '../components/UserAvatar'
import { formatRelativeTime, formatCommitAuthor } from '../utils/formatters'

interface Props {
  query: RepoCommitsList_query$key
  ownerUsername: string
  repoName: string
}

// Groups the (already tip-first) commit list into "Commits on <date>"
// sections, matching repoPage.html — a client-side grouping over data
// that's already in the right order, no extra fetching involved.
function formatDateHeading(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const RepoCommitsList = ({ query: queryRef, ownerUsername, repoName }: Props) => {
  // `Repository` doesn't implement Relay's `Node` interface (no type in this
  // schema does — see the note left for a future global-object-identification
  // pass), so @refetchable can't target a Repository-rooted fragment. Query
  // is one of the types @refetchable explicitly supports without Node, so
  // this re-resolves the owner/name path on every page instead — same net
  // effect, just rooted one level higher.
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    graphql`
      fragment RepoCommitsList_query on Query
      @refetchable(queryName: "RepoCommitsListPaginationQuery")
      @argumentDefinitions(
        owner_username: { type: "String!" }
        name: { type: "String!" }
        count: { type: "Int", defaultValue: 15 }
        cursor: { type: "ID" }
      ) {
        repository_by_owner_and_name(owner_username: $owner_username, name: $name) {
          commits(first: $count, after: $cursor) @connection(key: "RepoCommitsList_repository_commits") {
            edges {
              node {
                node
                short_node
                description
                author
                date
              }
            }
          }
        }
      }
    `,
    queryRef,
  )

  const commits = data.repository_by_owner_and_name?.commits?.edges ?? []

  if (commits.length === 0) {
    return <p className="py-8 text-muted-foreground">No commits yet.</p>
  }

  const groups: { heading: string; commits: (typeof commits)[number][] }[] = []
  for (const edge of commits) {
    if (!edge?.node) continue
    const heading = formatDateHeading(edge.node.date ?? 0)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup?.heading === heading) {
      lastGroup.commits.push(edge)
    } else {
      groups.push({ heading, commits: [edge] })
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <div key={group.heading}>
          <div className="mb-4 flex items-center gap-4">
            <span className="text-xs font-bold whitespace-nowrap text-muted-foreground uppercase">
              Commits on {group.heading}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="rounded-[4px] border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
            {group.commits.map((edge, index) => {
              const commit = edge!.node!
              return (
                <div key={commit.node}>
                  {index > 0 && <Separator />}
                  <Link
                    to={`/${ownerUsername}/${repoName}/commit/${commit.node}`}
                    className="flex items-start gap-4 p-5 text-foreground no-underline hover:bg-background"
                  >
                    <UserAvatar />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold">
                          {commit.description}
                        </p>
                        <span className="shrink-0 rounded-full bg-[#eff6ff] px-2 py-0.5 font-mono text-xs text-primary">
                          {commit.short_node}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs font-bold">{formatCommitAuthor(commit.author ?? '')}</span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(commit.date ?? 0)}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {hasNext && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" disabled={isLoadingNext} onClick={() => loadNext(15)}>
            {isLoadingNext ? 'Loading…' : 'Load earlier commits'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default RepoCommitsList
