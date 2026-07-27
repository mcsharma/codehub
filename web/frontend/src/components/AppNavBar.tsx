import * as stylex from '@stylexjs/stylex'
import { Link } from 'react-router'
import { graphql, useFragment } from 'react-relay'
import { FolderOpen, Key, LogOut } from 'lucide-react'
import type { AppNavBar_user$key } from './__generated__/AppNavBar_user.graphql'
import { buttonStyles } from '../ui/Button'
import { MenuRoot, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuLabel } from '../ui/Menu'
import UserAvatar from './UserAvatar'
import { colors, radii, space } from '../theme/tokens.stylex'

interface AppNavBarProps {
  currentUser: AppNavBar_user$key | null
  onLogout: () => void
}

const styles = stylex.create({
  appBar: {
    position: 'sticky',
    top: 0,
    zIndex: 1100,
    backgroundColor: colors.bg,
    color: colors.fg,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: space[4],
    minHeight: '48px',
    // MUI Toolbar's own real default gutters (theme.ts doesn't override
    // MuiToolbar) — 16px below the 600px breakpoint, 24px at/above it.
    paddingInline: {
      default: space[2],
      '@media (min-width: 600px)': space[3],
    },
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1.5],
    textDecoration: 'none',
    color: colors.fg,
    fontWeight: '700',
    fontSize: '1.125rem',
  },
  logoMark: {
    width: '28px',
    height: '28px',
    borderRadius: radii.md,
    backgroundColor: colors.brandSolid,
    color: colors.brandContrast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: space[0.5],
    flex: 1,
  },
  inertLink: {
    paddingInline: space[1.5],
    paddingBlock: space[0.5],
    borderRadius: radii.md,
    fontSize: '0.875rem',
    fontWeight: '500',
    color: colors.fgMuted,
    cursor: 'default',
  },
  reposButton: {
    color: colors.fg,
    backgroundColor: colors.bgMuted,
    fontWeight: '700',
    ':hover': { backgroundColor: colors.bgEmphasized },
  },
  avatarButton: {
    appearance: 'none',
    borderRadius: radii.full,
    border: 'none',
    background: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    outline: 'none',
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.brandFocusRing,
      outlineOffset: '2px',
    },
  },
})

// Nav items with no destination yet — visible so the chrome matches the
// mocks, but not wired up (no Dashboard/Explore/Documentation surface
// exists yet).
const InertNavLink = ({ label }: { label: string }) => (
  <span {...stylex.props(styles.inertLink)}>{label}</span>
)

const AppNavBar = ({ currentUser: currentUserRef, onLogout }: AppNavBarProps) => {
  const currentUser = useFragment(
    graphql`
      fragment AppNavBar_user on User {
        username
        first_name
      }
    `,
    currentUserRef,
  )

  return (
    <header {...stylex.props(styles.appBar)}>
      <div {...stylex.props(styles.toolbar)}>
        <Link to="/" {...stylex.props(styles.logo)}>
          <div {...stylex.props(styles.logoMark)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4V12M12 12L7 7M12 12L17 7M12 12V20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          CodeHub
        </Link>

        <nav {...stylex.props(styles.nav)}>
          <InertNavLink label="Dashboard" />
          {currentUser && (
            <Link
              to={`/${currentUser.username}`}
              {...stylex.props(...buttonStyles('subtle', 'sm'), styles.reposButton)}
            >
              Repositories
            </Link>
          )}
          <InertNavLink label="Explore" />
          <InertNavLink label="Documentation" />
        </nav>

        {currentUser ? (
          <MenuRoot>
            <MenuTrigger aria-label="Account menu" xstyle={styles.avatarButton}>
              <UserAvatar />
            </MenuTrigger>
            <MenuContent>
              <MenuLabel>Signed in as {currentUser.first_name ?? currentUser.username}</MenuLabel>
              <MenuSeparator />
              <MenuItem render={<Link to={`/${currentUser.username}`} />}>
                <FolderOpen size={16} />
                My Repositories
              </MenuItem>
              <MenuItem render={<Link to="/settings/tokens" />}>
                <Key size={16} />
                Personal Access Tokens
              </MenuItem>
              <MenuSeparator />
              <MenuItem onClick={onLogout}>
                <LogOut size={16} />
                Logout
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        ) : (
          <a href="/auth/google" {...stylex.props(...buttonStyles('solid', 'md'))}>
            Login with Google
          </a>
        )}
      </div>
    </header>
  )
}

export default AppNavBar
