import type { ReactNode } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { RepoTreePageQuery } from './__generated__/RepoTreePageQuery.graphql'
import type { PreloadedQuery } from 'react-relay'

import { Folder, FileText } from 'lucide-react'
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
const NAME_COLUMN_STYLE = { flex: '1 1 33%', minWidth: '100px' }
const MESSAGE_COLUMN_STYLE = {
  flex: '1 0.3 40%',
  maxWidth: '50%',
  minWidth: '20%',
}
const DATE_COLUMN_STYLE = {
  // flex-grow: 1 (not 0) — Message grows first and stops once it hits its
  // 40% cap, at which point it's excluded from further growth and Date
  // absorbs whatever's left, so its right-aligned text lands flush
  // against the row's actual right edge instead of stopping wherever
  // Name + Message(40%) + Date(170px) happens to land.
  flex: '1 1 20%',
  minWidth: '100px',
}

interface RepoTreeRowProps {
  to: string
  icon: ReactNode
  name: string
  message?: string | null
  date?: number | null
}

const RepoTreeRow = ({ to, icon, name, message, date }: RepoTreeRowProps) => (
  <Link
    to={to}
    className="flex items-center border-b border-border no-underline text-foreground last:border-b-0 hover:bg-accent"
  >
    <div
      style={NAME_COLUMN_STYLE}
      className="flex items-center gap-3 px-4 py-2"
    >
      {icon}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
        {name}
      </span>
    </div>
    <span
      style={MESSAGE_COLUMN_STYLE}
      title={message ?? undefined}
      className="overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2 text-sm text-muted-foreground"
    >
      {message ?? ''}
    </span>
    <span
      style={DATE_COLUMN_STYLE}
      className="px-4 py-2 text-right text-xs text-muted-foreground"
    >
      {date != null ? formatRelativeTime(date) : ''}
    </span>
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
      <p className="text-muted-foreground">This path doesn&apos;t exist.</p>
    )
  }

  if (directories.length === 0 && files.length === 0) {
    return <p className="text-muted-foreground">This directory is empty.</p>
  }

  return (
    <div className="overflow-hidden rounded-[4px] border border-border">
      <div className="flex border-b border-border bg-secondary">
        <span
          style={NAME_COLUMN_STYLE}
          className="whitespace-nowrap px-4 py-2 text-sm font-semibold text-muted-foreground"
        >
          Name
        </span>
        <span
          style={MESSAGE_COLUMN_STYLE}
          className="whitespace-nowrap px-4 py-2 text-sm font-semibold text-muted-foreground"
        >
          Last commit message
        </span>
        <span
          style={DATE_COLUMN_STYLE}
          className="whitespace-nowrap px-4 py-2 text-right text-sm font-semibold text-muted-foreground"
        >
          Last commit date
        </span>
      </div>
      {directories.map((entry) => (
        <RepoTreeRow
          key={entry.path}
          to={`${treeBase}/${entry.path}`}
          icon={
            <Folder
              size={20}
              fill={FOLDER_BLUE}
              strokeWidth={1}
              className="shrink-0"
              style={{ color: FOLDER_BLUE }}
            />
          }
          name={entry.name ?? ''}
        />
      ))}
      {files.map((entry) => (
        <RepoTreeRow
          key={entry.path}
          to={`${blobBase}/${entry.path}`}
          icon={<FileText size={20} className="shrink-0 text-muted-foreground" />}
          name={entry.name ?? ''}
          message={entry.last_commit_message}
          date={entry.last_commit_date}
        />
      ))}
    </div>
  )
}

export default RepoTreePage
