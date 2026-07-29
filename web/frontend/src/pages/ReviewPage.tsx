import { useMemo, useState } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { ReviewPageQuery } from './__generated__/ReviewPageQuery.graphql'
import { DiffView, DiffModeEnum } from '@git-diff-view/react'
import '@git-diff-view/react/styles/diff-view.css'
import './CommitPage.css'

import { ChevronLeft, FileText } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { ToggleGroup } from '../components/ui/toggle-group'
import { Toggle } from '../components/ui/toggle'
import UserAvatar from '../components/UserAvatar'
import CommitFileTree from '../components/CommitFileTree'
import CollapsibleSidebarPane from '../components/CollapsibleSidebarPane'
import { parseUnifiedDiff, countDiffStats } from '../utils/parseUnifiedDiff'

// v1 is deliberately minimal (see cli/, web/bff/src/pothos/schema/review.ts):
// metadata + diff for the latest (or a picked) version, no comments/accept
// flow yet — those land together later.
// A plain switch, not a lookup object, because Relay's generated enum type
// includes a `%future added value` catch-all for forward compatibility that
// an object index signature can't satisfy.
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

const ReviewPage = () => {
  const { reviewQueryRef } = useLoaderData() as {
    reviewQueryRef: PreloadedQuery<ReviewPageQuery>
  }

  const data = usePreloadedQuery<ReviewPageQuery>(
    graphql`
      query ReviewPageQuery($owner_username: String!, $name: String!, $number: Int!) {
        repository_by_owner_and_name(owner_username: $owner_username, name: $name) {
          name
          review(number: $number) {
            number
            title
            status
            created_time
            landed_node
            land_error
            author {
              username
            }
            versions {
              version
              head_node
              base_node
              commit {
                node
                short_node
                description
                author
                date
                parents
                files {
                  path
                  status
                }
                diff
              }
            }
          }
        }
      }
    `,
    reviewQueryRef,
  )

  const [mode, setMode] = useState<'unified' | 'split'>('split')
  const [activePath, setActivePath] = useState<string | null>(null)

  const handleSelectFile = (path: string) => {
    setActivePath(path)
    document.getElementById(path)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const { owner_username: ownerUsername, name: repoName, number } = reviewQueryRef.variables
  const repository = data.repository_by_owner_and_name
  const review = repository?.review
  const versions = review?.versions ?? []

  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const activeVersion = versions.find((v) => v.version === selectedVersion) ?? versions[versions.length - 1]
  const commit = activeVersion?.commit

  const diffChunksByPath = useMemo(() => parseUnifiedDiff(commit?.diff ?? ''), [commit?.diff])

  if (!repository || !review) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <p className="text-muted-foreground">D{number} not found.</p>
      </div>
    )
  }

  const files = commit?.files ?? []
  let totalAdditions = 0
  let totalDeletions = 0
  for (const file of files) {
    const { additions, deletions } = countDiffStats(diffChunksByPath.get(file.path ?? '') ?? '')
    totalAdditions += additions
    totalDeletions += deletions
  }

  return (
    <div className="px-5 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Link to={`/${ownerUsername}`} className="text-primary no-underline hover:underline">
            {ownerUsername}
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to={`/${ownerUsername}/${repoName}`} className="text-primary no-underline hover:underline">
            {repoName}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-primary">
            D{review.number}
          </span>
        </div>
        <Button variant="ghost" render={<Link to={`/${ownerUsername}/${repoName}`} />}>
          <ChevronLeft className="size-4" />
          Back to repo
        </Button>
      </div>

      <div className="mb-8 rounded-[4px] border border-border bg-card p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-3">
              <h1 className="text-lg font-bold">{review.title}</h1>
              <Badge variant={statusBadgeVariant(review.status ?? 'OPEN')}>{review.status}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <UserAvatar />
              <span className="text-sm font-bold">{review.author?.username}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Opened{' '}
                {review.created_time
                  ? new Date(review.created_time * 1000).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'unknown date'}
              </span>
            </div>
            {review.status === 'LAND_FAILED' && review.land_error && (
              <p className="mt-3 text-sm font-bold text-destructive">Landing failed: {review.land_error}</p>
            )}
            {review.status === 'LANDED' && review.landed_node && (
              <p className="mt-3 text-sm text-muted-foreground">
                Landed as <span className="font-mono">{review.landed_node.slice(0, 12)}</span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {versions.length > 1 && (
              <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                Version
                <select
                  className="rounded-[4px] border border-border bg-background px-2 py-1 font-mono text-sm text-foreground"
                  value={activeVersion?.version ?? ''}
                  onChange={(e) => setSelectedVersion(Number(e.target.value))}
                >
                  {versions.map((v) => (
                    <option key={v.version} value={v.version ?? ''}>
                      v{v.version} — {v.head_node?.slice(0, 12)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {commit && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Commit</span>
                <span className="rounded-full border border-border bg-background px-3 py-1 font-mono text-base font-bold">
                  {commit.node}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            Showing {files.length} changed file{files.length === 1 ? '' : 's'} with {totalAdditions} addition
            {totalAdditions === 1 ? '' : 's'} and {totalDeletions} deletion{totalDeletions === 1 ? '' : 's'}
          </span>
          <ToggleGroup value={[mode]} onValueChange={(value) => value[0] && setMode(value[0] as 'unified' | 'split')}>
            <Toggle value="split" variant="outline" size="sm">
              Split
            </Toggle>
            <Toggle value="unified" variant="outline" size="sm">
              Unified
            </Toggle>
          </ToggleGroup>
        </div>
      </div>

      <Separator />

      <CollapsibleSidebarPane
        label={`Files (${files.length})`}
        sidebar={
          <CommitFileTree
            files={files
              .filter((f): f is { path: string; status: string | null } => !!f.path)
              .map((f) => ({ path: f.path, status: f.status ?? 'modified' }))}
            activePath={activePath}
            onSelectFile={handleSelectFile}
          />
        }
      >
        <div className="flex flex-col gap-6">
          {files.map((file) => {
            const chunk = diffChunksByPath.get(file.path ?? '')
            const { additions, deletions } = countDiffStats(chunk ?? '')
            return (
              <div
                key={file.path}
                id={file.path ?? undefined}
                className="scroll-mt-4 overflow-hidden rounded-[4px] border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-muted-foreground" />
                    <span className="font-mono text-sm font-bold">{file.path}</span>
                    {file.status && file.status !== 'modified' && (
                      <span
                        className={`text-xs font-bold uppercase ${
                          file.status === 'added' ? 'text-success-foreground' : 'text-destructive'
                        }`}
                      >
                        {file.status}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xs font-bold text-success-foreground">+{additions}</span>
                    <span className="text-xs font-bold text-destructive">-{deletions}</span>
                  </div>
                </div>
                {chunk ? (
                  <DiffView
                    data={{
                      oldFile: { fileName: file.path },
                      newFile: { fileName: file.path },
                      hunks: [chunk],
                    }}
                    diffViewMode={mode === 'split' ? DiffModeEnum.Split : DiffModeEnum.Unified}
                    diffViewHighlight
                    diffViewWrap
                    diffViewFontSize={13}
                  />
                ) : (
                  <p className="p-5 text-muted-foreground">Binary file not shown.</p>
                )}
              </div>
            )
          })}
          {files.length === 0 && <p className="p-5 text-muted-foreground">No submitted version yet.</p>}
        </div>
      </CollapsibleSidebarPane>
    </div>
  )
}

export default ReviewPage
