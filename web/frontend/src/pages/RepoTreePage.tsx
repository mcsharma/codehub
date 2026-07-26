import type { ReactNode } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { RepoTreePageQuery } from './__generated__/RepoTreePageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'

import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import RepoHeader from '../components/RepoHeader'
import RepoPathBreadcrumb from '../components/RepoPathBreadcrumb'
import RepoDirectoryTree from '../components/RepoDirectoryTree'
import { formatRelativeTime } from '../utils/formatters'

// Apple's HIG "System Blue" — closest common match to the macOS Finder
// folder icon's blue, per the user's ask. Matches RepoDirectoryTree's
// sidebar folder color.
const FOLDER_BLUE = '#0A84FF'

// Shared row shell for both directory and file rows — icon + name on the
// left, an optional commit message in the middle, an optional relative
// time on the right. Folder rows simply have nothing for the middle/right
// columns, since hgweb has no efficient "last commit touching this
// directory" lookup (see the Code-tab redesign plan for why).
interface RepoTreeRowProps {
  to: string
  icon: ReactNode
  name: string
  message?: string | null
  date?: number | null
}

const RepoTreeRow = ({ to, icon, name, message, date }: RepoTreeRowProps) => (
  <Box
    component={Link}
    to={to}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      py: 1.25,
      px: 2,
      textDecoration: 'none',
      color: 'inherit',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flex: '0 1 260px',
        minWidth: 0,
      }}
    >
      {icon}
      <Typography
        variant="body2"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </Typography>
    </Box>
    <Typography
      variant="body2"
      color="text.secondary"
      title={message ?? undefined}
      sx={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {message ?? ''}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
      {date != null ? formatRelativeTime(date) : ''}
    </Typography>
  </Box>
)

const RepoTreePage = () => {
  const { repoTreeQueryRef } = useLoaderData() as {
    repoTreeQueryRef: PreloadedQuery<RepoTreePageQuery>
  }

  const data = usePreloadedQuery<RepoTreePageQuery>(
    graphql`
      query RepoTreePageQuery(
        $owner_username: String!
        $name: String!
        $rev: String!
        $path: String!
      ) {
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
          directory(rev: $rev, path: $path) {
            path
            directories {
              name
              path
            }
            files {
              name
              path
              last_commit_message
              last_commit_date
            }
          }
        }
      }
    `,
    repoTreeQueryRef,
  )

  const repository = data.repository_by_owner_and_name
  const { owner_username, name: repoName, rev } = repoTreeQueryRef.variables

  if (!repository) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography color="text.secondary">
          Repository &quot;{owner_username}/{repoName}&quot; not found.
        </Typography>
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
  const directory = repository.directory
  const directories = directory?.directories ?? []
  const files = directory?.files ?? []
  const treeBase = `/${ownerName}/${repository.name ?? repoName}/tree/${rev}`
  const blobBase = `/${ownerName}/${repository.name ?? repoName}/blob/${rev}`

  const activePath = directory?.path ?? ''

  return (
    <Box>
      <RepoHeader
        ownerUsername={ownerName}
        repoName={repository.name ?? repoName}
        visibility={repository.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
        isOwner={isOwner}
      />
      <Box sx={{ bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <RepoPathBreadcrumb
            ownerUsername={ownerName}
            repoName={repository.name ?? repoName}
            rev={rev}
            path={activePath}
          />

          <Divider sx={{ mb: 4 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              bgcolor: 'background.paper',
            }}
          >
            <Card
              sx={{
                width: 280,
                flexShrink: 0,
                borderRadius: '8px',
                position: 'sticky',
                top: 16,
                maxHeight: 'calc(100vh - 32px)',
                overflowY: 'auto',
              }}
            >
              <RepoDirectoryTree
                ownerUsername={ownerName}
                repoName={repository.name ?? repoName}
                rev={rev}
                activePath={activePath}
              />
            </Card>

            <Divider orientation="vertical" flexItem sx={{ mr: 3 }} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {!directory ? (
                <Typography color="text.secondary">
                  This path doesn&apos;t exist.
                </Typography>
              ) : directories.length === 0 && files.length === 0 ? (
                <Typography color="text.secondary">
                  This directory is empty.
                </Typography>
              ) : (
                <Card sx={{ borderRadius: '8px' }}>
                  {directories.map((entry, index) => (
                    <Box key={entry.path}>
                      {index > 0 && <Divider />}
                      <RepoTreeRow
                        to={`${treeBase}/${entry.path}`}
                        icon={
                          <FolderIcon
                            fontSize="small"
                            sx={{ color: FOLDER_BLUE }}
                          />
                        }
                        name={entry.name ?? ''}
                      />
                    </Box>
                  ))}
                  {files.map((entry, index) => (
                    <Box key={entry.path}>
                      {(index > 0 || directories.length > 0) && <Divider />}
                      <RepoTreeRow
                        to={`${blobBase}/${entry.path}`}
                        icon={
                          <InsertDriveFileOutlinedIcon
                            fontSize="small"
                            sx={{ color: 'text.secondary' }}
                          />
                        }
                        name={entry.name ?? ''}
                        message={entry.last_commit_message}
                        date={entry.last_commit_date}
                      />
                    </Box>
                  ))}
                </Card>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default RepoTreePage
