import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { Folder, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from '../ui/Collapsible'
import { buildFileTree } from '../utils/buildFileTree'
import type { FileTreeNode } from '../utils/buildFileTree'
import { colors, fontWeights, space } from '../theme/tokens.stylex'

// Apple's HIG "System Blue" — matches RepoDirectoryTree's folder color so
// the two sidebar trees (Code tab vs. commit diff view) read as the same
// component visually.
const FOLDER_BLUE = '#0A84FF'

const statusColor = (status: string): string => {
  if (status === 'added') return colors.successFg
  if (status === 'removed') return colors.errorFg
  return colors.warningFg // modified
}

const styles = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: space[0.5],
    width: '100%',
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    paddingBlock: space[0.5],
    paddingRight: space[1],
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    color: colors.fg,
    ':hover': { backgroundColor: colors.bgSubtle },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.brandFocusRing,
      outlineOffset: '-2px',
    },
  },
  rowActive: {
    backgroundColor: colors.info,
    ':hover': { backgroundColor: colors.info },
  },
  statusDotWrap: {
    width: '20px',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  icon: {
    color: colors.fgMuted,
    flexShrink: 0,
  },
  folderIcon: {
    color: FOLDER_BLUE,
    flexShrink: 0,
  },
  name: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nameActive: {
    color: colors.brandSolid,
    fontWeight: fontWeights.bold,
  },
})

interface NodeProps {
  node: FileTreeNode
  depth: number
  activePath: string | null
  onSelectFile: (path: string) => void
}

const FileTreeNodeRow = ({ node, depth, activePath, onSelectFile }: NodeProps) => {
  const [expanded, setExpanded] = useState(true)
  const indent = { paddingLeft: `${8 + depth * 12}px` }

  if (node.type === 'file') {
    const isActive = node.path === activePath
    return (
      <button
        onClick={() => onSelectFile(node.path)}
        style={indent}
        {...stylex.props(styles.row, isActive && styles.rowActive)}
      >
        <div {...stylex.props(styles.statusDotWrap)}>
          <div {...stylex.props(styles.statusDot)} style={{ backgroundColor: statusColor(node.status ?? '') }} />
        </div>
        <FileText size={16} {...stylex.props(styles.icon)} />
        <span {...stylex.props(styles.name, isActive && styles.nameActive)}>{node.name}</span>
      </button>
    )
  }

  return (
    <CollapsibleRoot open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger style={indent} {...stylex.props(styles.row)}>
        {expanded ? (
          <ChevronDown size={16} {...stylex.props(styles.icon)} />
        ) : (
          <ChevronRight size={16} {...stylex.props(styles.icon)} />
        )}
        <Folder size={16} fill={FOLDER_BLUE} strokeWidth={1} {...stylex.props(styles.folderIcon)} />
        <span {...stylex.props(styles.name)}>{node.name}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {node.children?.map((child) => (
          <FileTreeNodeRow
            key={child.path}
            node={child}
            depth={depth + 1}
            activePath={activePath}
            onSelectFile={onSelectFile}
          />
        ))}
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

interface CommitFileTreeProps {
  files: { path: string; status: string }[]
  activePath: string | null
  onSelectFile: (path: string) => void
}

// Styling mirrors RepoDirectoryTree (the Code tab's sidebar) exactly —
// same icon set, font, row height/padding — even though the two trees are
// built differently (this one has the full file list up front and builds
// a client-side trie, RepoDirectoryTree fetches level-by-level).
const CommitFileTree = ({ files, activePath, onSelectFile }: CommitFileTreeProps) => {
  const tree = buildFileTree(files)

  return (
    <div>
      {tree.map((node) => (
        <FileTreeNodeRow key={node.path} node={node} depth={0} activePath={activePath} onSelectFile={onSelectFile} />
      ))}
    </div>
  )
}

export default CommitFileTree
