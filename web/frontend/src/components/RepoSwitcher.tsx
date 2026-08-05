import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { fetchQuery, graphql } from 'react-relay'
import { ChevronDown } from 'lucide-react'
import type { RepoSwitcherQuery } from './__generated__/RepoSwitcherQuery.graphql'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { RelayEnv } from '../RelayEnvironment'

interface RepoOption {
  name: string
  vcsKind: 'HG' | 'GIT'
}

interface RepoSwitcherProps {
  ownerUsername: string
  repoName: string
}

// Preserve which tab the user is on when jumping to a different repo —
// the specific rev/path/commit-node in the current URL won't exist in the
// target repo, so each tab falls back to that tab's default location
// (tip's root tree, or the settings/commits root) rather than reusing it.
const activeTabSuffix = (pathname: string): string => {
  if (pathname.includes('/tree/') || pathname.includes('/blob/')) {
    return '/tree/tip'
  }
  if (pathname.endsWith('/settings')) {
    return '/settings'
  }
  return ''
}

// The repo-name half of the header's "owner / repo" label, turned into a
// switcher: click it to see the owner's other repos and jump straight to
// one. The owner list is fetched lazily on first open (same pattern as
// RepoDirectoryTree's on-demand fetchQuery) rather than on every page
// load, since it's not always needed.
const RepoSwitcher = ({ ownerUsername, repoName }: RepoSwitcherProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [repos, setRepos] = useState<RepoOption[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen || repos !== null || loading) return
    setLoading(true)
    fetchQuery<RepoSwitcherQuery>(
      RelayEnv,
      graphql`
        query RepoSwitcherQuery($ownerUsername: String!) {
          owner_by_name(name: $ownerUsername) {
            __typename
            ... on User {
              owned_repositories(first: 50) {
                edges {
                  node {
                    name
                    vcs_kind
                  }
                }
              }
            }
            ... on Organization {
              repositories(first: 50) {
                edges {
                  node {
                    name
                    vcs_kind
                  }
                }
              }
            }
          }
        }
      `,
      { ownerUsername },
    ).subscribe({
      next: (data) => {
        const owner = data.owner_by_name
        const edges =
          owner?.__typename === 'User'
            ? owner.owned_repositories?.edges
            : owner?.__typename === 'Organization'
              ? owner.repositories?.edges
              : []
        const list: RepoOption[] = (edges ?? [])
          .map((edge) => edge?.node)
          .filter((node): node is { name: string; vcs_kind: 'HG' | 'GIT' | null } => !!node?.name)
          .map((node) => ({ name: node.name, vcsKind: node.vcs_kind === 'GIT' ? 'GIT' : 'HG' }) as const)
        setRepos(list)
        setLoading(false)
      },
      error: () => {
        setRepos([])
        setLoading(false)
      },
    })
  }

  const handleSelect = (name: string) => {
    if (name !== repoName) {
      navigate(`/${ownerUsername}/${name}${activeTabSuffix(location.pathname)}`)
    }
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="px-1">
            {repoName}
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        {loading && <DropdownMenuItem disabled>Loading…</DropdownMenuItem>}
        {repos?.length === 0 && (
          <DropdownMenuItem disabled>No repositories</DropdownMenuItem>
        )}
        {repos?.map((repo) => (
          <DropdownMenuItem
            key={repo.name}
            onClick={() => handleSelect(repo.name)}
            className="flex items-center justify-between gap-3"
          >
            {repo.name}
            <span className="text-xs text-muted-foreground">
              {repo.vcsKind === 'GIT' ? 'Git' : 'Mercurial'}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default RepoSwitcher
