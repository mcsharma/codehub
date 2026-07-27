import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import RepoHeader from './RepoHeader'
import RepoPathBreadcrumb from './RepoPathBreadcrumb'
import RepoDirectoryTree from './RepoDirectoryTree'
import CollapsibleSidebarPane from './CollapsibleSidebarPane'

interface RepoCodeLayoutProps {
  ownerUsername: string
  repoName: string
  visibility: 'PUBLIC' | 'PRIVATE'
  isOwner: boolean
  rev: string
  activePath: string
  children: ReactNode
}

// Shared chrome for the two Code-tab pages (RepoTreePage, RepoBlobPage):
// header, collapsible folder/file nav sidebar, and the breadcrumb above
// the page-specific content (directory listing vs. file content).
const RepoCodeLayout = ({
  ownerUsername,
  repoName,
  visibility,
  isOwner,
  rev,
  activePath,
  children,
}: RepoCodeLayoutProps) => (
  <Box>
    <RepoHeader
      ownerUsername={ownerUsername}
      repoName={repoName}
      visibility={visibility}
      isOwner={isOwner}
    />
    <CollapsibleSidebarPane
      label="File Tree"
      contentPr={2}
      sidebar={
        <RepoDirectoryTree
          ownerUsername={ownerUsername}
          repoName={repoName}
          rev={rev}
          activePath={activePath}
        />
      }
      mainHeader={
        <RepoPathBreadcrumb
          ownerUsername={ownerUsername}
          repoName={repoName}
          rev={rev}
          path={activePath}
        />
      }
    >
      {children}
    </CollapsibleSidebarPane>
  </Box>
)

export default RepoCodeLayout
