import * as stylex from '@stylexjs/stylex'
import { Link } from 'react-router'
import { colors, fontWeights, space } from '../theme/tokens.stylex'

interface RepoPathBreadcrumbProps {
  ownerUsername: string
  repoName: string
  rev: string
  path: string
}

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space[1],
    fontSize: '0.9375rem',
  },
  segment: {
    display: 'flex',
    alignItems: 'center',
    gap: space[0.5],
  },
  slash: {
    color: colors.fgMuted,
  },
  link: {
    color: colors.brandSolid,
    textDecoration: 'none',
    ':hover': { textDecoration: 'underline' },
  },
  repoLink: {
    fontWeight: fontWeights.bold,
  },
  current: {
    color: colors.fg,
  },
})

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
    <div {...stylex.props(styles.root)}>
      <Link to={treeBase} {...stylex.props(styles.link, styles.repoLink)}>
        {repoName}
      </Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const segmentPath = segments.slice(0, index + 1).join('/')
        return (
          <div key={segmentPath} {...stylex.props(styles.segment)}>
            <span {...stylex.props(styles.slash)}>/</span>
            {isLast ? (
              <span {...stylex.props(styles.current)}>{segment}</span>
            ) : (
              <Link to={`${treeBase}/${segmentPath}`} {...stylex.props(styles.link)}>
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
