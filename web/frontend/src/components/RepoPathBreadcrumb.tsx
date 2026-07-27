import { Link } from 'react-router'

interface RepoPathBreadcrumbProps {
  ownerUsername: string
  repoName: string
  rev: string
  path: string
}

// Shared by RepoTreePage and RepoBlobPage — every segment except the last
// (the directory/file currently being viewed) links back to that ancestor
// directory.
const RepoPathBreadcrumb = ({
  ownerUsername,
  repoName,
  rev,
  path,
}: RepoPathBreadcrumbProps) => {
  const segments = path ? path.split('/').filter(Boolean) : []
  const treeBase = `/${ownerUsername}/${repoName}/tree/${rev}`

  return (
    <div className="flex flex-wrap items-center gap-2 text-[0.9375rem]">
      <Link to={treeBase} className="font-bold text-primary no-underline">
        {repoName}
      </Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const segmentPath = segments.slice(0, index + 1).join('/')
        return (
          <div key={segmentPath} className="flex items-center gap-1">
            <span className="text-muted-foreground">/</span>
            {isLast ? (
              <span>{segment}</span>
            ) : (
              <Link to={`${treeBase}/${segmentPath}`} className="text-primary no-underline">
                {segment}
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default RepoPathBreadcrumb
