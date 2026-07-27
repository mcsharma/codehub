import { graphql, usePaginationFragment } from 'react-relay'
import { Link } from 'react-router'
import type { RepoCommitsList_query$key } from './__generated__/RepoCommitsList_query.graphql'
import * as stylex from '@stylexjs/stylex'

import { Card } from '../ui/Card'
import { Text } from '../ui/Text'
import { Button } from '../ui/Button'
import { Divider } from '../ui/Divider'
import UserAvatar from '../components/UserAvatar'
import { formatRelativeTime, formatCommitAuthor } from '../utils/formatters'
import { colors, fonts, fontSizes, fontWeights, radii, space } from '../theme/tokens.stylex'

interface Props {
  query: RepoCommitsList_query$key
  ownerUsername: string
  repoName: string
}

const styles = stylex.create({
  noCommitsText: {
    paddingVertical: space[4],
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: space[5],
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: space[2],
    marginBottom: space[2],
  },
  groupHeading: {
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    color: colors.fgMuted,
    whiteSpace: 'nowrap',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: colors.border,
  },
  commitRow: {
    padding: space[2.5],
    display: 'flex',
    alignItems: 'flex-start',
    gap: space[2],
    textDecoration: 'none',
    color: 'inherit',
    ':hover': { backgroundColor: colors.bgSubtle },
  },
  commitTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  commitHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  commitDescription: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  shortNode: {
    fontFamily: fonts.mono,
    color: colors.brandFg,
    backgroundColor: colors.brandSubtle,
    paddingInline: space[1],
    paddingBlock: space[0.25],
    borderRadius: radii.sm,
    flexShrink: 0,
    fontSize: fontSizes.xs,
  },
  commitMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1.5],
    marginTop: space[0.5],
  },
  authorName: {
    fontWeight: fontWeights.bold,
  },
  loadMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: space[1],
  },
})

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
    return (
      <Text color="muted" xstyle={styles.noCommitsText}>
        No commits yet.
      </Text>
    )
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
    <div {...stylex.props(styles.root)}>
      {groups.map((group) => (
        <div key={group.heading}>
          <div {...stylex.props(styles.groupHeader)}>
            <Text size="xs" color="muted" xstyle={styles.groupHeading}>
              Commits on {group.heading}
            </Text>
            <div {...stylex.props(styles.dividerLine)} />
          </div>
          <Card>
            {group.commits.map((edge, index) => {
              const commit = edge!.node!
              return (
                <div key={commit.node}>
                  {index > 0 && <Divider />}
                  <Link
                    to={`/${ownerUsername}/${repoName}/commit/${commit.node}`}
                    {...stylex.props(styles.commitRow)}
                  >
                    <UserAvatar />
                    <div {...stylex.props(styles.commitTextContainer)}>
                      <div {...stylex.props(styles.commitHeaderRow)}>
                        <Text size="sm" xstyle={styles.commitDescription}>
                          {commit.description}
                        </Text>
                        <span {...stylex.props(styles.shortNode)}>
                          {commit.short_node}
                        </span>
                      </div>
                      <div {...stylex.props(styles.commitMetaRow)}>
                        <Text size="xs" xstyle={styles.authorName}>
                          {formatCommitAuthor(commit.author ?? '')}
                        </Text>
                        <Text size="xs" color="muted">
                          {formatRelativeTime(commit.date ?? 0)}
                        </Text>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </Card>
        </div>
      ))}

      {hasNext && (
        <div {...stylex.props(styles.loadMoreContainer)}>
          <Button variant="outline" disabled={isLoadingNext} onClick={() => loadNext(15)}>
            {isLoadingNext ? 'Loading…' : 'Load earlier commits'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default RepoCommitsList
