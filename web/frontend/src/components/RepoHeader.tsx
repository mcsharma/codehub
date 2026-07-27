import { Link, useLocation } from 'react-router'
import { Code, History, Disc, Settings } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import StatusBadge from './StatusBadge'
import CloneButton from './CloneButton'
import RepoSwitcher from './RepoSwitcher'

interface RepoHeaderProps {
  ownerUsername: string
  repoName: string
  visibility: 'PUBLIC' | 'PRIVATE'
  isOwner: boolean
}

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
    <div className="border-b border-border bg-background">
      <div className="pt-4 pb-0 px-4">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="px-1 font-normal"
              render={<Link to={`/${ownerUsername}`} />}
            >
              {ownerUsername}
            </Button>
            {' / '}
            <RepoSwitcher ownerUsername={ownerUsername} repoName={repoName} />
            <StatusBadge
              label={visibility === 'PUBLIC' ? 'Public' : 'Private'}
              tone={visibility === 'PUBLIC' ? 'neutral' : 'primary'}
            />
          </div>
          <CloneButton ownerUsername={ownerUsername} repoName={repoName} />
        </div>

        {/* Drives navigation via the URL, not panel-switching — `value`
            is derived from the current route, each Tab wraps a
            react-router `Link` via `render`, and no `TabsContent` is
            rendered since the router (not Tabs) swaps the page content.
            Don't "simplify" this back to plain links — Tabs still buys
            real keyboard/ARIA tablist behavior. */}
        <Tabs value={activeTab} variant="underline">
          <TabsList className="h-10 w-full justify-start gap-6 bg-transparent p-0">
            <TabsTrigger
              value="code"
              render={<Link to={`${repoBase}/tree/tip`} />}
              nativeButton={false}
              className="flex-none gap-1.5 rounded-none px-0.5 py-1.5"
            >
              <Code className="size-4" />
              Code
            </TabsTrigger>
            <TabsTrigger
              value="commits"
              render={<Link to={repoBase} />}
              nativeButton={false}
              className="flex-none gap-1.5 rounded-none px-0.5 py-1.5"
            >
              <History className="size-4" />
              Commits
            </TabsTrigger>
            <TabsTrigger
              value="issues"
              disabled
              className="flex-none gap-1.5 rounded-none px-0.5 py-1.5"
            >
              <Disc className="size-4" />
              Issues
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              disabled={!isOwner}
              render={
                isOwner ? <Link to={`${repoBase}/settings`} /> : undefined
              }
              nativeButton={!isOwner}
              className="flex-none gap-1.5 rounded-none px-0.5 py-1.5"
            >
              <Settings className="size-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

export default RepoHeader
