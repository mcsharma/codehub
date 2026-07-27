import { useMemo, useState } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { Link, useLoaderData } from 'react-router'
import type { PreloadedQuery } from 'react-relay'
import type { CommitPageQuery } from './__generated__/CommitPageQuery.graphql'
import { DiffView, DiffModeEnum } from '@git-diff-view/react'
import '@git-diff-view/react/styles/diff-view.css'
import './CommitPage.css'

import { ChevronLeft, FileText } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { ToggleGroup } from '../components/ui/toggle-group'
import { Toggle } from '../components/ui/toggle'
import UserAvatar from '../components/UserAvatar'
import CommitFileTree from '../components/CommitFileTree'
import CollapsibleSidebarPane from '../components/CollapsibleSidebarPane'
import { formatCommitAuthor } from '../utils/formatters'
import { parseUnifiedDiff, countDiffStats } from '../utils/parseUnifiedDiff'

const CommitPage = () => {
  const { commitQueryRef } = useLoaderData() as {
    commitQueryRef: PreloadedQuery<CommitPageQuery>
  }

  const data = usePreloadedQuery<CommitPageQuery>(
    graphql`
      query CommitPageQuery(
        $owner_username: String!
        $name: String!
        $node: String!
      ) {
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
          name
          commit(node: $node) {
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
    `,
    commitQueryRef,
  )

  const [mode, setMode] = useState<'unified' | 'split'>('split')
  const [activePath, setActivePath] = useState<string | null>(null)

  const handleSelectFile = (path: string) => {
    setActivePath(path)
    document
      .getElementById(path)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const { owner_username: ownerUsername, name: repoName } =
    commitQueryRef.variables
  const repository = data.repository_by_owner_and_name
  const commit = repository?.commit

  const diffChunksByPath = useMemo(
    () => parseUnifiedDiff(commit?.diff ?? ''),
    [commit?.diff],
  )

  if (!repository || !commit) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <p className="text-muted-foreground">Commit not found.</p>
      </div>
    )
  }

  const files = commit.files ?? []
  let totalAdditions = 0
  let totalDeletions = 0
  for (const file of files) {
    const { additions, deletions } = countDiffStats(
      diffChunksByPath.get(file.path ?? '') ?? '',
    )
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
          <span className="text-muted-foreground">/ commit /</span>
          <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-primary">
            {commit.short_node}
          </span>
        </div>
        <Button variant="ghost" size="sm" render={<Link to={`/${ownerUsername}/${repoName}`} />}>
          <ChevronLeft className="size-4" />
          Back to commits
        </Button>
      </div>

      <div className="mb-8 rounded-[4px] border border-border bg-card p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div className="min-w-0 flex-1">
            <p className="mb-4 text-base font-normal">{commit.description}</p>
            <div className="flex items-center gap-3">
              <UserAvatar />
              <span className="text-sm font-bold">{formatCommitAuthor(commit.author ?? '')}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Committed on{' '}
                {commit.date
                  ? new Date(commit.date * 1000).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'unknown date'}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Commit</span>
              <span className="rounded-full border border-border bg-background px-3 py-1 font-mono text-base font-bold">
                {commit.node}
              </span>
            </div>
            {commit.parents && commit.parents.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Parent</span>
                <Link
                  to={`/${ownerUsername}/${repoName}/commit/${commit.parents[0]}`}
                  className="font-mono font-bold text-primary no-underline hover:underline"
                >
                  {commit.parents[0]!.slice(0, 12)}
                </Link>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            Showing {files.length} changed file{files.length === 1 ? '' : 's'}{' '}
            with {totalAdditions} addition
            {totalAdditions === 1 ? '' : 's'} and {totalDeletions} deletion
            {totalDeletions === 1 ? '' : 's'}
          </span>
          <ToggleGroup
            value={[mode]}
            onValueChange={(value) => value[0] && setMode(value[0] as 'unified' | 'split')}
          >
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
              .filter(
                (f): f is { path: string; status: string | null } => !!f.path,
              )
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
                    diffViewMode={
                      mode === 'split'
                        ? DiffModeEnum.Split
                        : DiffModeEnum.Unified
                    }
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
        </div>
      </CollapsibleSidebarPane>
    </div>
  )
}

export default CommitPage
