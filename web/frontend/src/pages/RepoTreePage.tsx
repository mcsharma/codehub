import type { ReactNode } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { RepoTreePageQuery } from './__generated__/RepoTreePageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import { formatRelativeTime } from '../utils/formatters'

// Apple's HIG "System Blue" — closest common match to the macOS Finder
// folder icon's blue, per the user's ask. Matches RepoDirectoryTree's
// sidebar folder color.
const FOLDER_BLUE = '#0A84FF'

// A `table-layout: fixed` <table> can't do staged/floor-then-cascade
// shrinking — fixed layout treats column widths as static targets, with
// no concept of "shrink column A down to a floor, then redistribute the
// remaining squeeze to column B." That's a flexbox capability, so these
// rows are plain flex rows (styled to still read as a table) instead.
//
// The shrink staging itself relies on how flexbox distributes shrinkage:
// each pass shrinks items proportionally to `flex-basis × flex-shrink`,
// and any item that would go below its own `min-width` gets pinned there
// and dropped from the next pass. Name/Date use a normal shrink weight
// (1) so nearly all shrinkage lands on them first; Message uses a tiny
// weight (0.01) so it barely shrinks at all — until Name/Date both hit
// their 60px floor and drop out, at which point Message is the only
// flexible item left and absorbs 100% of any further squeeze.
const NAME_COLUMN_SX = {
  flex: '1 1 33%',
  minWidth: '100px',
  py: 1,
  px: 2,
} as const

const MESSAGE_COLUMN_SX = {
  flex: '1 0.3 40%',
  maxWidth: '50%',
  minWidth: '20%',
  py: 1,
  px: 2,
} as const

const DATE_COLUMN_SX = {
  // flex-grow: 1 (not 0) — Message grows first and stops once it hits its
  // 40% cap, at which point it's excluded from further growth and Date
  // absorbs whatever's left, so its right-aligned text lands flush
  // against the row's actual right edge instead of stopping wherever
  // Name + Message(40%) + Date(170px) happens to land.
  flex: '1 1 20%',
  minWidth: '100px',
  py: 1,
  px: 2,
  textAlign: 'right',
} as const

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
      textDecoration: 'none',
      color: 'inherit',
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Box
      sx={{
        ...NAME_COLUMN_SX,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
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
        ...MESSAGE_COLUMN_SX,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {message ?? ''}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={DATE_COLUMN_SX}>
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
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
          name
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

  const directory = repository?.directory
  const directories = directory?.directories ?? []
  const files = directory?.files ?? []
  const treeBase = `/${owner_username}/${repository?.name ?? repoName}/tree/${rev}`
  const blobBase = `/${owner_username}/${repository?.name ?? repoName}/blob/${rev}`

  if (!directory) {
    return (
      <Typography color="text.secondary">
        This path doesn&apos;t exist.
      </Typography>
    )
  }

  if (directories.length === 0 && files.length === 0) {
    return (
      <Typography color="text.secondary">This directory is empty.</Typography>
    )
  }

  return (
    <Card sx={{ boxShadow: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          bgcolor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            ...NAME_COLUMN_SX,
            fontWeight: 600,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          Name
        </Typography>
        <Typography
          variant="body2"
          sx={{
            ...MESSAGE_COLUMN_SX,
            fontWeight: 600,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          Last commit message
        </Typography>
        <Typography
          variant="body2"
          sx={{
            ...DATE_COLUMN_SX,
            fontWeight: 600,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          Last commit date
        </Typography>
      </Box>
      {directories.map((entry) => (
        <RepoTreeRow
          key={entry.path}
          to={`${treeBase}/${entry.path}`}
          icon={<FolderIcon fontSize="small" sx={{ color: FOLDER_BLUE }} />}
          name={entry.name ?? ''}
        />
      ))}
      {files.map((entry) => (
        <RepoTreeRow
          key={entry.path}
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
      ))}
    </Card>
  )
}

export default RepoTreePage
