import * as stylex from '@stylexjs/stylex'
import { Link, useLocation } from 'react-router'
import {
  MuiCodeIcon,
  MuiHistoryIcon,
  MuiAdjustIcon,
  MuiSettingsIcon,
} from './icons/MuiIcons'
import { Container } from '../ui/Container'
import { Heading } from '../ui/Heading'
import { TabsRoot, TabsList, TabsTrigger } from '../ui/Tabs'
import StatusBadge from './StatusBadge'
import CloneButton from './CloneButton'
import RepoSwitcher from './RepoSwitcher'
import { colors, fontSizes, space } from '../theme/tokens.stylex'

interface RepoHeaderProps {
  ownerUsername: string
  repoName: string
  visibility: 'PUBLIC' | 'PRIVATE'
  isOwner: boolean
}

const styles = stylex.create({
  container: {
    paddingBottom: 0,
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[1],
    gap: space[2],
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1],
  },
  ownerLink: {
    color: colors.brandFg,
    textDecoration: 'none',
    fontSize: fontSizes.md,
    fontWeight: '400',
    ':hover': { textDecoration: 'underline' },
  },
})

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
    <Container maxWidth="full" xstyle={styles.container}>
      <div {...stylex.props(styles.top)}>
        <div {...stylex.props(styles.left)}>
          <Heading as="h1" size="lg">
            <Link to={`/${ownerUsername}`} {...stylex.props(styles.ownerLink)}>
              {ownerUsername}
            </Link>{' '}
            / <RepoSwitcher ownerUsername={ownerUsername} repoName={repoName} />
          </Heading>
          <StatusBadge
            label={visibility === 'PUBLIC' ? 'Public' : 'Private'}
            tone={visibility === 'PUBLIC' ? 'neutral' : 'primary'}
          />
        </div>
        <CloneButton ownerUsername={ownerUsername} repoName={repoName} />
      </div>

      {/* Drives navigation via the URL, not panel-switching — see
            ui/Tabs.tsx's file-level comment for why this is still Tabs
            and not plain links. */}
      <TabsRoot value={activeTab}>
        <TabsList>
          <TabsTrigger
            value="code"
            render={<Link to={`${repoBase}/tree/tip`} />}
          >
            <MuiCodeIcon />
            Code
          </TabsTrigger>
          <TabsTrigger value="commits" render={<Link to={repoBase} />}>
            <MuiHistoryIcon />
            Commits
          </TabsTrigger>
          <TabsTrigger value="issues" disabled>
            <MuiAdjustIcon />
            Issues
          </TabsTrigger>
          {isOwner ? (
            <TabsTrigger
              value="settings"
              render={<Link to={`${repoBase}/settings`} />}
            >
              <MuiSettingsIcon />
              Settings
            </TabsTrigger>
          ) : (
            <TabsTrigger value="settings" disabled>
              <MuiSettingsIcon />
              Settings
            </TabsTrigger>
          )}
        </TabsList>
      </TabsRoot>
    </Container>
  )
}

export default RepoHeader
