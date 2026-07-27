import { useState } from 'react'
import type { MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { fetchQuery, graphql } from 'react-relay'
import type { RepoSwitcherQuery } from './__generated__/RepoSwitcherQuery.graphql'

import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'
import { RelayEnv } from '../RelayEnvironment'

interface RepoOption {
  name: string
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [repos, setRepos] = useState<RepoOption[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    if (repos === null && !loading) {
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
                    }
                  }
                }
              }
              ... on Organization {
                repositories(first: 50) {
                  edges {
                    node {
                      name
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
            .map((edge) => edge?.node?.name)
            .filter((name): name is string => !!name)
            .map((name) => ({ name }))
          setRepos(list)
          setLoading(false)
        },
        error: () => {
          setRepos([])
          setLoading(false)
        },
      })
    }
  }

  const handleClose = () => setAnchorEl(null)

  const handleSelect = (name: string) => {
    handleClose()
    if (name !== repoName) {
      navigate(`/${ownerUsername}/${name}${activeTabSuffix(location.pathname)}`)
    }
  }

  return (
    <>
      <Box
        component="span"
        onClick={handleOpen}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          cursor: 'pointer',
          borderRadius: 1,
          px: 0.5,
          verticalAlign: 'middle',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {repoName}
        <ExpandMoreOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      </Box>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        {loading && <MenuItem disabled>Loading…</MenuItem>}
        {repos?.length === 0 && <MenuItem disabled>No repositories</MenuItem>}
        {repos?.map((repo) => (
          <MenuItem
            key={repo.name}
            selected={repo.name === repoName}
            onClick={() => handleSelect(repo.name)}
          >
            {repo.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default RepoSwitcher
