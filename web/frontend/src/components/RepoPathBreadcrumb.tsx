import { Link } from 'react-router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        fontSize: '0.9375rem',
      }}
    >
      <Typography
        component={Link}
        to={treeBase}
        color="primary"
        sx={{ fontWeight: 700, textDecoration: 'none' }}
      >
        {repoName}
      </Typography>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const segmentPath = segments.slice(0, index + 1).join('/')
        return (
          <Box
            key={segmentPath}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Typography color="text.secondary">/</Typography>
            {isLast ? (
              <Typography>{segment}</Typography>
            ) : (
              <Typography
                component={Link}
                to={`${treeBase}/${segmentPath}`}
                color="primary"
                sx={{ textDecoration: 'none' }}
              >
                {segment}
              </Typography>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export default RepoPathBreadcrumb
