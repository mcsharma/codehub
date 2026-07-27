import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { RepoTreePageQuery } from './__generated__/RepoTreePageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'
import { Folder, FileText } from 'lucide-react'
import { Card } from '../ui/Card'
import { Text } from '../ui/Text'
import { colors, space } from '../theme/tokens.stylex'
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
// weight (0.3) so it barely shrinks at all — until Name/Date both hit
// their floor and drop out, at which point Message is the only flexible
// item left and absorbs 100% of any further squeeze.
const styles = stylex.create({
  // Header row — grey.100 background to match prod
  headerRow: {
    display: 'flex',
    backgroundColor: colors.bgMuted,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  // Data row
  dataRow: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: colors.fg,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    ':hover': {
      backgroundColor: colors.bgSubtle,
    },
  },
  // Column flex rules
  nameCol: {
    flex: '1 1 33%',
    minWidth: '100px',
    paddingBlock: space[1],
    paddingInline: space[2],
    display: 'flex',
    alignItems: 'center',
    gap: space[1.5],
  },
  messageCol: {
    flex: '1 0.3 40%',
    maxWidth: '50%',
    minWidth: '20%',
    paddingBlock: space[1],
    paddingInline: space[2],
    overflow: 'hidden',
  },
  dateCol: {
    // flex-grow: 1 (not 0) — Message grows first and stops once it hits
    // its 40% cap, at which point it's excluded from further growth and
    // Date absorbs whatever's left, so its right-aligned text lands flush
    // against the row's actual right edge instead of stopping wherever
    // Name + Message(40%) + Date(170px) happens to land.
    flex: '1 1 20%',
    minWidth: '100px',
    paddingBlock: space[1],
    paddingInline: space[2],
    textAlign: 'right',
  },
  // Header-cell typography tweak — same weight as prod's `fontWeight: 600`
  headerCell: {
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  nameText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  messageText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  folderIcon: {
    flexShrink: 0,
    color: FOLDER_BLUE,
  },
  fileIcon: {
    flexShrink: 0,
    color: colors.fgMuted,
  },
})

interface RepoTreeRowProps {
  to: string
  icon: ReactNode
  name: string
  message?: string | null
  date?: number | null
}

const RepoTreeRow = ({ to, icon, name, message, date }: RepoTreeRowProps) => (
  <Link to={to} {...stylex.props(styles.dataRow)}>
    <div {...stylex.props(styles.nameCol)}>
      {icon}
      <Text as="span" size="sm" xstyle={styles.nameText}>
        {name}
      </Text>
    </div>
    <div {...stylex.props(styles.messageCol)} title={message ?? undefined}>
      <Text as="span" size="sm" color="muted" xstyle={styles.messageText}>
        {message ?? ''}
      </Text>
    </div>
    <div {...stylex.props(styles.dateCol)}>
      <Text as="span" size="xs" color="muted">
        {date != null ? formatRelativeTime(date) : ''}
      </Text>
    </div>
  </Link>
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
      <Text color="muted">This path doesn&apos;t exist.</Text>
    )
  }

  if (directories.length === 0 && files.length === 0) {
    return (
      <Text color="muted">This directory is empty.</Text>
    )
  }

  return (
    <Card>
      {/* Header row — grey.100 background matches prod */}
      <div {...stylex.props(styles.headerRow)}>
        <div {...stylex.props(styles.nameCol, styles.headerCell)}>
          <Text as="span" size="sm" color="muted">Name</Text>
        </div>
        <div {...stylex.props(styles.messageCol, styles.headerCell)}>
          <Text as="span" size="sm" color="muted">Last commit message</Text>
        </div>
        <div {...stylex.props(styles.dateCol, styles.headerCell)}>
          <Text as="span" size="sm" color="muted">Last commit date</Text>
        </div>
      </div>

      {directories.map((entry) => (
        <RepoTreeRow
          key={entry.path}
          to={`${treeBase}/${entry.path}`}
          icon={<Folder size={16} fill={FOLDER_BLUE} {...stylex.props(styles.folderIcon)} />}
          name={entry.name ?? ''}
        />
      ))}
      {files.map((entry) => (
        <RepoTreeRow
          key={entry.path}
          to={`${blobBase}/${entry.path}`}
          icon={<FileText size={16} {...stylex.props(styles.fileIcon)} />}
          name={entry.name ?? ''}
          message={entry.last_commit_message}
          date={entry.last_commit_date}
        />
      ))}
    </Card>
  )
}

export default RepoTreePage
