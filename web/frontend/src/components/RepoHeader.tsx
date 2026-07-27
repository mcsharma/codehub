import { Link, useLocation } from 'react-router'

import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import AdjustOutlinedIcon from '@mui/icons-material/AdjustOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import StatusBadge from './StatusBadge'
import CloneButton from './CloneButton'
import RepoSwitcher from './RepoSwitcher'

interface RepoHeaderProps {
  ownerUsername: string
  repoName: string
  visibility: 'PUBLIC' | 'PRIVATE'
  isOwner: boolean
}

const tabSx = {
  minHeight: 40,
  py: 0.75,
} as const

// Shared breadcrumb/badge/clone-button/tabs chrome for every repo-scoped
// page (RepoPage, RepoTreePage, RepoBlobPage, the settings route) — each
// of those is its own flat top-level route with its own loader/query (see
// router.tsx), so which tab reads as "active" is derived from the current
// URL rather than any shared state.
const RepoHeader = ({
  ownerUsername,
  repoName,
  visibility,
  isOwner,
}: RepoHeaderProps) => {
  const location = useLocation()
  const activeTab =
    location.pathname.includes('/tree/') || location.pathname.includes('/blob/')
      ? 'code'
      : location.pathname.endsWith('/settings')
        ? 'settings'
        : 'commits'

  const repoBase = `/${ownerUsername}/${repoName}`

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth={false} sx={{ pb: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              <Typography
                component={Link}
                to={`/${ownerUsername}`}
                color="text.secondary"
                sx={{ fontWeight: 400 }}
              >
                {ownerUsername}
              </Typography>{' '}
              /{' '}
              <RepoSwitcher ownerUsername={ownerUsername} repoName={repoName} />
            </Typography>
            <StatusBadge
              label={visibility === 'PUBLIC' ? 'Public' : 'Private'}
              tone={visibility === 'PUBLIC' ? 'neutral' : 'primary'}
            />
          </Box>
          <CloneButton ownerUsername={ownerUsername} repoName={repoName} />
        </Box>

        <Tabs value={activeTab} sx={{ minHeight: 40 }}>
          <Tab
            component={Link}
            to={`${repoBase}/tree/tip`}
            value="code"
            icon={<CodeOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Code"
            sx={tabSx}
          />
          <Tab
            component={Link}
            to={repoBase}
            value="commits"
            icon={<HistoryOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Commits"
            sx={tabSx}
          />
          <Tab
            value="issues"
            disabled
            icon={<AdjustOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Issues"
            sx={tabSx}
          />
          <Tab
            component={Link}
            to={`${repoBase}/settings`}
            value="settings"
            disabled={!isOwner}
            icon={<SettingsOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Settings"
            sx={tabSx}
          />
        </Tabs>
      </Container>
    </Box>
  )
}

export default RepoHeader
