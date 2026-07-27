import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchQuery, graphql } from 'react-relay'
import { Folder, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import type { RepoDirectoryTreeQuery } from './__generated__/RepoDirectoryTreeQuery.graphql'
import { RelayEnv } from '../RelayEnvironment'
import { cn } from '@/lib/utils'

// Apple's HIG "System Blue" — closest common match to the macOS Finder
// folder icon's blue, per the user's ask.
const FOLDER_BLUE = '#0A84FF'

interface Entry {
  name: string
  path: string
  type: 'folder' | 'file'
}

interface RepoDirectoryTreeProps {
  ownerUsername: string
  repoName: string
  rev: string
  activePath: string
}

const rowClassName = (active: boolean) =>
  cn(
    'flex w-full items-center gap-1.5 py-1 pr-2 text-sm no-underline',
    active ? 'bg-[#eff6ff] text-primary hover:bg-[#eff6ff]' : 'text-foreground hover:bg-accent',
  )

// Folder + file nav tree for the Code tab sidebar. Unlike CommitFileTree
// (which builds a complete trie client-side from a flat list it already
// has in hand), there's no "whole tree" endpoint for repo browsing, so
// each level is fetched on demand as the user expands/navigates into it.
const RepoDirectoryTree = ({ ownerUsername, repoName, rev, activePath }: RepoDirectoryTreeProps) => {
  const [childrenByPath, setChildrenByPath] = useState<Map<string, Entry[]>>(new Map())
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set())

  const fetchChildren = useCallback(
    (path: string) => {
      setLoadingPaths((prev) => new Set(prev).add(path))
      fetchQuery<RepoDirectoryTreeQuery>(
        RelayEnv,
        graphql`
          query RepoDirectoryTreeQuery($owner_username: String!, $name: String!, $rev: String!, $path: String!) {
            repository_by_owner_and_name(owner_username: $owner_username, name: $name) {
              directory(rev: $rev, path: $path) {
                directories {
                  name
                  path
                }
                files {
                  name
                  path
                }
              }
            }
          }
        `,
        { owner_username: ownerUsername, name: repoName, rev, path },
        // Serve from the in-memory Relay store when this exact level was
        // already fetched this session (e.g. navigating away and back)
        // instead of fetchQuery's default of always hitting the network.
        // Safe from staleness across a real reload (Cmd+R, URL bar) since
        // RelayEnv's store is created fresh on every page load — there's
        // nothing to read from until this component fetches again.
        { fetchPolicy: 'store-or-network' },
      ).subscribe({
        next: (data) => {
          const directory = data.repository_by_owner_and_name?.directory
          const entries: Entry[] = [
            ...(directory?.directories ?? []).map((d): Entry => ({ name: d.name ?? '', path: d.path ?? '', type: 'folder' })),
            ...(directory?.files ?? []).map((f): Entry => ({ name: f.name ?? '', path: f.path ?? '', type: 'file' })),
          ]
          setChildrenByPath((prev) => new Map(prev).set(path, entries))
          setLoadingPaths((prev) => {
            const next = new Set(prev)
            next.delete(path)
            return next
          })
        },
        error: () => {
          setLoadingPaths((prev) => {
            const next = new Set(prev)
            next.delete(path)
            return next
          })
        },
      })
    },
    [ownerUsername, repoName, rev],
  )

  // Root, fetched once on mount (and again if the repo/rev changes).
  useEffect(() => {
    fetchChildren('')
  }, [fetchChildren])

  // Auto-expand every ancestor of the active path so it's visible in the
  // tree without the user manually clicking down to it.
  useEffect(() => {
    const segments = activePath ? activePath.split('/').filter(Boolean) : []
    const ancestorPaths = segments.slice(0, -1).map((_, i) => segments.slice(0, i + 1).join('/'))
    const pathsToReveal = ['', ...ancestorPaths]

    setExpandedPaths((prev) => {
      const next = new Set(prev)
      for (const p of pathsToReveal) next.add(p)
      return next
    })
    for (const p of pathsToReveal) {
      if (!childrenByPath.has(p) && !loadingPaths.has(p)) {
        fetchChildren(p)
      }
    }
    // Only re-run when the active path (or fetcher identity) changes —
    // childrenByPath/loadingPaths are read here just to avoid redundant
    // fetches, not to drive this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath, fetchChildren])

  const treeBase = `/${ownerUsername}/${repoName}/tree/${rev}`
  const blobBase = `/${ownerUsername}/${repoName}/blob/${rev}`

  const renderNode = (entry: Entry, depth: number) => {
    const indent = { paddingLeft: `${8 + depth * 12}px` }

    if (entry.type === 'file') {
      const isActiveFile = entry.path === activePath
      return (
        <Link
          key={entry.path}
          to={`${blobBase}/${entry.path}`}
          style={indent}
          className={rowClassName(isActiveFile)}
        >
          <span className="w-5 shrink-0" />
          <FileText size={20} className="shrink-0 text-muted-foreground" />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{entry.name}</span>
        </Link>
      )
    }

    const isExpanded = expandedPaths.has(entry.path)
    const isActive = entry.path === activePath
    const children = childrenByPath.get(entry.path)

    const handleClick = () => {
      setExpandedPaths((prev) => {
        const next = new Set(prev)
        if (next.has(entry.path)) {
          next.delete(entry.path)
        } else {
          next.add(entry.path)
        }
        return next
      })
      if (!childrenByPath.has(entry.path) && !loadingPaths.has(entry.path)) {
        fetchChildren(entry.path)
      }
    }

    return (
      <div key={entry.path}>
        <Link
          to={`${treeBase}/${entry.path}`}
          onClick={handleClick}
          style={indent}
          className={rowClassName(isActive)}
        >
          {isExpanded ? (
            <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
          )}
          <Folder size={20} fill={FOLDER_BLUE} strokeWidth={1} className="shrink-0" style={{ color: FOLDER_BLUE }} />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{entry.name}</span>
        </Link>
        {isExpanded && children?.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  const rootChildren = childrenByPath.get('') ?? []

  return (
    <div>
      {rootChildren.length === 0 && !loadingPaths.has('') ? (
        <span className="block px-3 text-xs text-muted-foreground">This directory is empty.</span>
      ) : (
        rootChildren.map((entry) => renderNode(entry, 0))
      )}
    </div>
  )
}

export default RepoDirectoryTree
