import { Suspense } from 'react'
import { graphql, usePreloadedQuery } from 'react-relay'
import { Outlet, useLoaderData, useParams } from 'react-router'
import type { RepoCodeShellQuery } from './__generated__/RepoCodeShellQuery.graphql'
import type { PreloadedQuery } from 'react-relay'

import RepoHeader from '../components/RepoHeader'
import RepoPathBreadcrumb from '../components/RepoPathBreadcrumb'
import RepoDirectoryTree from '../components/RepoDirectoryTree'
import CollapsibleSidebarPane from '../components/CollapsibleSidebarPane'
import RepoNotFound from '../components/RepoNotFound'
import { resolveOwnerName } from '../utils/repoOwner'

// Shared parent route for both Code-tab views (RepoTreePage at .../tree/...,
// RepoBlobPage at .../blob/...). Rendering the header and the collapsible
// file-tree sidebar here — once — instead of inside each page keeps them
// mounted while switching between directory and file view: React Router
// only swaps the <Outlet/>'s matched child, so the sidebar's fetch/expand
// state survives instead of the whole shell unmounting and remounting
// (which is what caused the visible flicker, worse in prod where the
// content route's separate JS chunk has to be fetched over the network).
const RepoCodeShell = () => {
  const { repoCodeShellQueryRef } = useLoaderData() as {
    repoCodeShellQueryRef: PreloadedQuery<RepoCodeShellQuery>
  }

  const data = usePreloadedQuery<RepoCodeShellQuery>(
    graphql`
      query RepoCodeShellQuery($owner_username: String!, $name: String!) {
        current_user {
          username
        }
        repository_by_owner_and_name(
          owner_username: $owner_username
          name: $name
        ) {
          name
          visibility
          owner {
            __typename
            ... on User {
              username
            }
            ... on Organization {
              name
            }
          }
        }
      }
    `,
    repoCodeShellQueryRef,
  )

  // `rev` and the splat (file/directory path) belong to whichever child
  // route (tree/* or blob/*) is currently matched, but useParams() always
  // returns the deepest matched route's already-merged params — readable
  // here in the parent just as well as inside the child.
  const params = useParams()
  const ownerUsernameParam = params.owner!
  const repoNameParam = params.repo!
  const rev = params.rev!
  const activePath = params['*'] ?? ''

  const repository = data.repository_by_owner_and_name

  if (!repository) {
    return (
      <RepoNotFound ownerUsername={ownerUsernameParam} repoName={repoNameParam} />
    )
  }

  const ownerName = resolveOwnerName(repository.owner, ownerUsernameParam)
  const isOwner = data.current_user?.username === ownerName
  const repoName = repository.name ?? repoNameParam

  return (
    <div>
      <RepoHeader
        ownerUsername={ownerName}
        repoName={repoName}
        visibility={repository.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
        isOwner={isOwner}
      />
      <CollapsibleSidebarPane
        label="File Tree"
        contentPr={2}
        sidebar={
          <RepoDirectoryTree
            ownerUsername={ownerName}
            repoName={repoName}
            rev={rev}
            activePath={activePath}
          />
        }
        mainHeader={
          <RepoPathBreadcrumb
            ownerUsername={ownerName}
            repoName={repoName}
            rev={rev}
            path={activePath}
          />
        }
      >
        {/* Local boundary so switching tree/blob only re-suspends this
            inner content, not the header/sidebar above. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </CollapsibleSidebarPane>
    </div>
  )
}

export default RepoCodeShell
