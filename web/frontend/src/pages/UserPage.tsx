import { graphql, useFragment } from 'react-relay'
import { Link } from 'react-router'
import type { UserPage_user$key } from './__generated__/UserPage_user.graphql'
import * as stylex from '@stylexjs/stylex'
import { Plus } from 'lucide-react'

import { Container } from '../ui/Container'
import { Text } from '../ui/Text'
import { Heading } from '../ui/Heading'
import { buttonStyles } from '../ui/Button'
import RepoCard from '../components/RepoCard'
import { fontWeights, fontSizes, space } from '../theme/tokens.stylex'

interface Props {
  user: UserPage_user$key
  isOwnProfile: boolean
}

const styles = stylex.create({
  containerPadding: {
    paddingVertical: space[6],
  },
  headerRow: {
    display: 'flex',
    flexDirection: {
      default: 'column',
      '@media (min-width: 768px)': 'row',
    },
    alignItems: {
      default: 'flex-start',
      '@media (min-width: 768px)': 'center',
    },
    justifyContent: 'space-between',
    gap: space[3],
    marginBottom: space[5],
  },
  title: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes['2xl'],
  },
  subtitle: {
    marginTop: space[0.5],
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 640px)': '1fr 1fr',
      '@media (min-width: 960px)': '1fr 1fr 1fr',
    },
    gap: space[3],
  },
  orgsSection: {
    marginTop: space[6],
  },
  orgsTitle: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.lg,
    marginBottom: space[2],
  },
  orgsList: {
    display: 'flex',
    gap: space[1],
    flexWrap: 'wrap',
  },
})

const UserPage = ({ user: userRef, isOwnProfile }: Props) => {
  const user = useFragment(
    graphql`
      fragment UserPage_user on User {
        username
        first_name
        owned_repositories(first: 50) {
          edges {
            node {
              id
              name
              description
              visibility
              updated_time
            }
          }
        }
        admin_of_organizations(first: 20) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    userRef,
  )

  const repos = user.owned_repositories?.edges ?? []
  const orgs = user.admin_of_organizations?.edges ?? []

  return (
    <Container maxWidth="lg" xstyle={styles.containerPadding}>
      <div {...stylex.props(styles.headerRow)}>
        <div>
          <Heading as="h1" size="2xl" xstyle={styles.title}>
            {isOwnProfile ? 'Repositories' : `${user.first_name ?? user.username}'s repositories`}
          </Heading>
          <Text color="muted" xstyle={styles.subtitle}>
            {isOwnProfile
              ? 'Manage and organize your projects.'
              : `@${user.username}`}
          </Text>
        </div>
        {isOwnProfile && (
          <Link
            to="/new"
            {...stylex.props(...buttonStyles('solid', 'md'))}
          >
            <Plus size={16} style={{ marginRight: 6 }} />
            Create Repository
          </Link>
        )}
      </div>

      {repos.length > 0 ? (
        <div {...stylex.props(styles.grid)}>
          {repos.map((edge) => {
            if (!edge?.node) {
              return null
            }
            return (
              <RepoCard
                key={edge.node.id}
                ownerUsername={user.username ?? ''}
                name={edge.node.name ?? ''}
                description={edge.node.description ?? null}
                visibility={edge.node.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
                updatedTime={edge.node.updated_time ?? 0}
              />
            )
          })}
        </div>
      ) : (
        <Text color="muted">No repositories yet.</Text>
      )}

      {orgs.length > 0 && (
        <div {...stylex.props(styles.orgsSection)}>
          <Heading as="h2" size="lg" xstyle={styles.orgsTitle}>
            Organizations
          </Heading>
          <div {...stylex.props(styles.orgsList)}>
            {orgs.map((edge) => {
              if (!edge?.node) {
                return null
              }
              return (
                <Link
                  key={edge.node.id}
                  to={`/${edge.node.name}`}
                  {...stylex.props(...buttonStyles('outline', 'md'))}
                >
                  {edge.node.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </Container>
  )
}

export default UserPage
