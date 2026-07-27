import { graphql, usePreloadedQuery } from 'react-relay'
import { useLoaderData } from 'react-router'
import type { RepoSettingsPageQuery } from './__generated__/RepoSettingsPageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'
import * as stylex from '@stylexjs/stylex'

import { Container } from '../ui/Container'
import { Text } from '../ui/Text'
import RepoHeader from '../components/RepoHeader'
import RepoSettingsPanel from './RepoSettingsPanel'
import { colors, space } from '../theme/tokens.stylex'

const styles = stylex.create({
  root: {
    backgroundColor: colors.bg,
  },
  inner: {
    paddingBlock: space[5],
  },
  errorInner: {
    paddingVertical: space[6],
  },
})

const RepoSettingsPage = () => {
  const { repoSettingsQueryRef } = useLoaderData() as {
    repoSettingsQueryRef: PreloadedQuery<RepoSettingsPageQuery>
  }

  const data = usePreloadedQuery<RepoSettingsPageQuery>(
    graphql`
      query RepoSettingsPageQuery($owner_username: String!, $name: String!) {
        current_user {
          username
        }
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
          id
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
      }
    `,
    repoSettingsQueryRef,
  )

  const repository = data.repository_by_owner_and_name
  const { owner_username, name: repoName } = repoSettingsQueryRef.variables

  if (!repository) {
    return (
      <Container maxWidth="lg" xstyle={styles.errorInner}>
        <Text color="muted">
          Repository &quot;{owner_username}/{repoName}&quot; not found.
        </Text>
      </Container>
    )
  }

  const ownerName: string =
    (repository.owner?.__typename === 'User'
      ? repository.owner.username
      : repository.owner?.__typename === 'Organization'
        ? repository.owner.name
        : null) ?? owner_username

  const isOwner = data.current_user?.username === ownerName

  if (!isOwner) {
    return (
      <div>
        <RepoHeader
          ownerUsername={ownerName}
          repoName={repository.name ?? repoName}
          visibility={repository.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
          isOwner={false}
        />
        <Container maxWidth="lg" xstyle={styles.errorInner}>
          <Text color="muted">You don&apos;t have access to this page.</Text>
        </Container>
      </div>
    )
  }

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
          <RepoSettingsPanel
            repositoryId={repository.id ?? ''}
            ownerUsername={ownerName}
            repoName={repository.name ?? repoName}
            visibility={repository.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
          />
        </Container>
      </div>
    </div>
  )
}

export default RepoSettingsPage
