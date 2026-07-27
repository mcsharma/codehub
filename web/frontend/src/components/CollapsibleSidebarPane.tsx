import type { ReactNode } from 'react'
import { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { cn } from '@/lib/utils'

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

const SIDEBAR_WIDTH = 264

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
  // real `md` breakpoint, unmodified in theme.ts.)
  const isNarrowViewport = useMediaQuery('(max-width: 899px)')
  const [manualCollapsed, setManualCollapsed] = useState<boolean | null>(null)
  const collapsed = manualCollapsed ?? isNarrowViewport

  const toggleCollapsed = () => setManualCollapsed(!collapsed)

  const buttonLabel = collapsed
    ? `Show ${label.toLowerCase()}`
    : `Collapse ${label.toLowerCase()}`
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-start">
      {!collapsed && (
        <>
          <div
            style={{ width: SIDEBAR_WIDTH }}
            className="sticky top-4 mt-1 max-h-[calc(100vh-32px)] shrink-0 overflow-y-auto"
          >
            <div className="flex items-center px-3 py-2.5">
              <span className="text-sm font-semibold">{label}</span>
            </div>
            {sidebar}
          </div>

          <Separator orientation="vertical" className="h-auto self-stretch" />
        </>
      )}

      <div className={cn('min-w-0 flex-1 pl-4', contentPr === 2 && 'pr-4')}>
        <div className="flex items-center gap-1 py-2">
          <Button
            variant="ghost"
            size="icon"
            title={buttonLabel}
            aria-label={buttonLabel}
            onClick={toggleCollapsed}
            className="text-[#616161]"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </Button>
          {mainHeader}
        </div>
        {children}
      </div>
    </div>
  )
}

export default CollapsibleSidebarPane
