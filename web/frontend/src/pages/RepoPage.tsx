import { graphql, usePreloadedQuery } from 'react-relay'
import { useLoaderData } from 'react-router'
import type { RepoPageQuery } from './__generated__/RepoPageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'
import * as stylex from '@stylexjs/stylex'

import { Container } from '../ui/Container'
import RepoHeader from '../components/RepoHeader'
import RepoNotFound from '../components/RepoNotFound'
import RepoCommitsList from './RepoCommitsList'
import { resolveOwnerName } from '../utils/repoOwner'
import { colors, space } from '../theme/tokens.stylex'

const styles = stylex.create({
  root: {
    backgroundColor: colors.bg,
  },
  inner: {
    paddingBlock: space[5],
  },
})

const RepoPage = () => {
  const { repoQueryRef } = useLoaderData() as {
    repoQueryRef: PreloadedQuery<RepoPageQuery>
  }

  const data = usePreloadedQuery<RepoPageQuery>(
    graphql`
      query RepoPageQuery($owner_username: String!, $name: String!) {
        current_user {
          username
        }
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
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
        }
        ...RepoCommitsList_query @arguments(owner_username: $owner_username, name: $name)
      }
    `,
    repoQueryRef,
  )

  const repository = data.repository_by_owner_and_name
  const { owner_username, name: repoName } = repoQueryRef.variables

  if (!repository) {
    return <RepoNotFound ownerUsername={owner_username} repoName={repoName} />
  }

  const ownerName = resolveOwnerName(repository.owner, owner_username)
  const isOwner = data.current_user?.username === ownerName

  return (
    <div>
      <RepoHeader
        ownerUsername={ownerName}
        repoName={repository.name ?? repoName}
        visibility={repository.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
        isOwner={isOwner}
      />
      <div {...stylex.props(styles.root)}>
        <Container maxWidth="lg" xstyle={styles.inner}>
          <RepoCommitsList
            query={data}
            ownerUsername={ownerName}
            repoName={repository.name ?? repoName}
          />
        </Container>
      </div>
    </div>
  )
}

export default RepoPage
