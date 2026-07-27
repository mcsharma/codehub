import type { ReactNode } from 'react'
import { useState } from 'react'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
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

// Split-pane shell shared by the Code tab (RepoCodeLayout) and the commit
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
  const theme = useTheme()
  // Below this width the sidebar collapses on its own to leave room for
  // the main content. A manual toggle always wins over this once the user
  // has touched it, even if the viewport is still narrow.
  const isNarrowViewport = useMediaQuery(theme.breakpoints.down('md'))
  const [manualCollapsed, setManualCollapsed] = useState<boolean | null>(null)
  const collapsed = manualCollapsed ?? isNarrowViewport

  const toggleCollapsed = () => setManualCollapsed(!collapsed)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        minHeight: 'calc(100vh - 140px)',
      }}
    >
      {!collapsed && (
        <>
          <Box
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              position: 'sticky',
              top: 16,
              mt: 1,
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 1.25,
                px: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {label}
              </Typography>
            </Box>
            {sidebar}
          </Box>

          <Divider orientation="vertical" flexItem />
        </>
      )}

      <Box sx={{ flex: 1, minWidth: 0, pl: 2, pr: contentPr }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            py: 1,
          }}
        >
          <Tooltip
            title={
              collapsed
                ? `Show ${label.toLowerCase()}`
                : `Collapse ${label.toLowerCase()}`
            }
          >
            <IconButton
              onClick={toggleCollapsed}
              sx={{
                color: 'grey.700',
                width: 40,
                height: 40,
              }}
            >
              <SidebarToggleIcon
                fontSize="small"
                sx={collapsed ? { transform: 'scaleX(-1)' } : undefined}
              />
            </IconButton>
          </Tooltip>
          {mainHeader}
        </Box>
        {children}
      </Box>
    </Box>
  )
}

export default CollapsibleSidebarPane
