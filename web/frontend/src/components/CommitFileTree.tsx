import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildFileTree } from '../utils/buildFileTree'
import type { FileTreeNode } from '../utils/buildFileTree'

// Apple's HIG "System Blue" — matches RepoDirectoryTree's folder color so
// the two sidebar trees (Code tab vs. commit diff view) read as the same
// component visually.
const FOLDER_BLUE = '#0A84FF'

const statusDotClassName = (status: string): string => {
  if (status === 'added') return 'bg-success-foreground'
  if (status === 'removed') return 'bg-destructive'
  return 'bg-warning-foreground' // modified
}

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
        type="button"
        onClick={() => onSelectFile(node.path)}
        style={indent}
        className={cn(
          'flex w-full items-center gap-1.5 border-none py-1 pr-2 text-left',
          isActive ? 'bg-[#eff6ff]' : 'bg-transparent hover:bg-accent',
        )}
      >
        <span className="flex w-5 shrink-0 justify-center">
          <span className={cn('size-1.5 rounded-full', statusDotClassName(node.status ?? ''))} />
        </span>
        <FileText size={16} className="shrink-0 text-muted-foreground" />
        <span
          className={cn(
            'overflow-hidden text-ellipsis whitespace-nowrap text-sm',
            isActive ? 'font-bold text-primary' : 'font-normal text-foreground',
          )}
        >
          {node.name}
        </span>
      </button>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        style={indent}
        className="flex w-full items-center gap-1.5 border-none bg-transparent py-1 pr-2 text-left hover:bg-accent"
      >
        {expanded ? (
          <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
        )}
        <Folder size={16} fill={FOLDER_BLUE} strokeWidth={1} className="shrink-0" style={{ color: FOLDER_BLUE }} />
        <span className="whitespace-nowrap text-sm">{node.name}</span>
      </button>
      {expanded &&
        node.children?.map((child) => (
          <FileTreeNodeRow
            key={child.path}
            node={child}
            depth={depth + 1}
            activePath={activePath}
            onSelectFile={onSelectFile}
          />
        ))}
    </div>
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
