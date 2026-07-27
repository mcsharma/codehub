import * as stylex from '@stylexjs/stylex'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchQuery, graphql } from 'react-relay'
import { Folder, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import type { RepoDirectoryTreeQuery } from './__generated__/RepoDirectoryTreeQuery.graphql'
import { RelayEnv } from '../RelayEnvironment'
import { colors, fontSizes, space } from '../theme/tokens.stylex'

// Apple's HIG "System Blue" — closest common match to the macOS Finder
// folder icon's blue, per the user's ask.
const FOLDER_BLUE = '#0A84FF'

const styles = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: space[0.5],
    width: '100%',
    textDecoration: 'none',
    color: colors.fg,
    paddingBlock: space[0.5],
    paddingRight: space[1],
    fontSize: fontSizes.sm,
    ':hover': { backgroundColor: colors.bgSubtle },
  },
  rowActive: {
    backgroundColor: colors.info,
    ':hover': { backgroundColor: colors.info },
  },
  spacer: {
    width: '20px',
    flexShrink: 0,
  },
  icon: {
    color: colors.fgMuted,
    flexShrink: 0,
  },
  folderIcon: {
    color: FOLDER_BLUE,
    flexShrink: 0,
  },
  name: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nameActive: {
    color: colors.brandSolid,
  },
  empty: {
    display: 'block',
    paddingInline: space[1.5],
    color: colors.fgMuted,
    fontSize: fontSizes.xs,
  },
})

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
          {...stylex.props(styles.row, isActiveFile && styles.rowActive)}
        >
          <div {...stylex.props(styles.spacer)} />
          <FileText size={16} {...stylex.props(styles.icon)} />
          <span {...stylex.props(styles.name, isActiveFile && styles.nameActive)}>{entry.name}</span>
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
          {...stylex.props(styles.row, isActive && styles.rowActive)}
        >
          {isExpanded ? (
            <ChevronDown size={16} {...stylex.props(styles.icon)} />
          ) : (
            <ChevronRight size={16} {...stylex.props(styles.icon)} />
          )}
          <Folder size={16} fill={FOLDER_BLUE} strokeWidth={1} {...stylex.props(styles.folderIcon)} />
          <span {...stylex.props(styles.name)}>{entry.name}</span>
        </Link>
        {isExpanded && children?.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  const rootChildren = childrenByPath.get('') ?? []

  return (
    <div>
      {rootChildren.length === 0 && !loadingPaths.has('') ? (
        <span {...stylex.props(styles.empty)}>This directory is empty.</span>
      ) : (
        rootChildren.map((entry) => renderNode(entry, 0))
      )}
    </div>
  )
}

export default RepoDirectoryTree
