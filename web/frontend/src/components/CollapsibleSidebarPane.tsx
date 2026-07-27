import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Text } from '../ui/Text'
import { IconButton } from '../ui/IconButton'
import { Tooltip } from '../ui/Tooltip'
import { Divider } from '../ui/Divider'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { rawColors, space } from '../theme/tokens.stylex'
import SidebarToggleIcon from './icons/SidebarToggleIcon'

interface CollapsibleSidebarPaneProps {
  label: string
  sidebar: ReactNode
  mainHeader?: ReactNode
  // Right padding for the main column. Callers whose own outer chrome
  // already provides matching horizontal page padding (e.g. CommitPage's
  // `px: "20px"` wrapper) should leave this at 0 so the content's right
  // edge lines up with that padding rather than getting an extra inset.
  contentPr?: number
  children: ReactNode
}

const SIDEBAR_WIDTH = 280

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: 'calc(100vh - 140px)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    position: 'sticky',
    top: 16,
    marginTop: space[1],
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingBlock: '10px',
    paddingInline: space[1.5],
  },
  // MUI's body2 usage here has a literal `fontWeight: 600` — not one of
  // the named weights in the token scale (400/500/700), so it's inline.
  sidebarLabel: {
    fontWeight: '600',
  },
  main: {
    flex: 1,
    minWidth: 0,
    paddingLeft: space[2],
  },
  // contentPr is only ever 0 (default) or 2 in practice across the two
  // callers — static variants rather than a dynamic inline value, since
  // StyleX styles must be statically analyzable.
  mainPr2: {
    paddingRight: space[2],
  },
  mainHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: space[0.5],
    paddingBlock: space[1],
  },
  toggleButton: {
    color: rawColors.grey700,
  },
  toggleIconCollapsed: {
    transform: 'scaleX(-1)',
  },
})

// Split-pane shell shared by the Code tab (RepoCodeShell) and the commit
// diff page (CommitPage): a sticky, collapsible sidebar with a label
// header, a full-height vertical divider, and a main column whose header
// row always carries the collapse/expand toggle — in both states — so it
// doesn't jump between the sidebar and the main pane as you toggle it.
const CollapsibleSidebarPane = ({
  label,
  sidebar,
  mainHeader,
  contentPr = 0,
  children,
}: CollapsibleSidebarPaneProps) => {
  // Below this width the sidebar collapses on its own to leave room for
  // the main content. A manual toggle always wins over this once the user
  // has touched it, even if the viewport is still narrow. (900px — MUI's
  // real `md` breakpoint, unmodified in theme.ts — this governs layout
  // behavior, not visual theming, so it isn't sourced from the token file.)
  const isNarrowViewport = useMediaQuery('(max-width: 899px)')
  const [manualCollapsed, setManualCollapsed] = useState<boolean | null>(null)
  const collapsed = manualCollapsed ?? isNarrowViewport

  const toggleCollapsed = () => setManualCollapsed(!collapsed)

  return (
    <div {...stylex.props(styles.root)}>
      {!collapsed && (
        <>
          <div {...stylex.props(styles.sidebar)}>
            <div {...stylex.props(styles.sidebarHeader)}>
              <Text as="span" size="sm" xstyle={styles.sidebarLabel}>
                {label}
              </Text>
            </div>
            {sidebar}
          </div>

          <Divider orientation="vertical" />
        </>
      )}

      <div {...stylex.props(styles.main, contentPr === 2 && styles.mainPr2)}>
        <div {...stylex.props(styles.mainHeader)}>
          <Tooltip
            content={
              collapsed
                ? `Show ${label.toLowerCase()}`
                : `Collapse ${label.toLowerCase()}`
            }
          >
            <IconButton
              aria-label={
                collapsed
                  ? `Show ${label.toLowerCase()}`
                  : `Collapse ${label.toLowerCase()}`
              }
              variant="ghost"
              onClick={toggleCollapsed}
              xstyle={styles.toggleButton}
            >
              <SidebarToggleIcon
                {...stylex.props(collapsed && styles.toggleIconCollapsed)}
              />
            </IconButton>
          </Tooltip>
          {mainHeader}
        </div>
        {children}
      </div>
    </div>
  )
}

export default CollapsibleSidebarPane
