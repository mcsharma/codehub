import type { SVGProps } from 'react'

// MUI's icon set has nothing matching GitHub/VS Code's classic
// "sidebar-collapse" glyph (a tall rounded panel split into a wide left
// column and a narrow right column, with a solid filled arrow inside the
// left column), so it's hand-built here as a plain SVG.
const SidebarToggleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...props}>
    <rect
      x="2"
      y="1.5"
      width="20"
      height="21"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <line
      x1="15.3"
      y1="1.5"
      x2="15.3"
      y2="22.5"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <polygon points="10.9,8.3 10.9,15.7 5.3,12" fill="currentColor" />
  </svg>
)

export default SidebarToggleIcon
