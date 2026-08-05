import { Link } from 'react-router'
import StatusBadge from './StatusBadge'
import { formatRelativeTime } from '../utils/formatters'

interface RepoCardProps {
  ownerUsername: string
  name: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE'
  vcsKind: 'HG' | 'GIT'
  updatedTime: number
}

const RepoCard = ({ ownerUsername, name, description, visibility, vcsKind, updatedTime }: RepoCardProps) => {
  return (
    <Link
      to={`/${ownerUsername}/${name}`}
      className="flex h-full flex-col rounded-[4px] border border-border bg-card p-6 text-foreground no-underline shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)] transition-[box-shadow,border-color] duration-150 hover:border-primary hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex size-11 items-center justify-center rounded-full bg-[#eff6ff] text-base font-bold text-primary">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge label={vcsKind === 'GIT' ? 'Git' : 'Mercurial'} tone="neutral" />
          <StatusBadge
            label={visibility === 'PUBLIC' ? 'Public' : 'Private'}
            tone={visibility === 'PUBLIC' ? 'neutral' : 'primary'}
          />
        </div>
      </div>
      <h3 className="mb-2 text-xl font-bold">{name}</h3>
      <p className="mb-4 flex-1 text-sm text-muted-foreground">
        {description ?? 'No description provided.'}
      </p>
      <div className="flex justify-end border-t border-border pt-4">
        <span className="text-xs font-bold text-muted-foreground">
          Updated {formatRelativeTime(updatedTime)}
        </span>
      </div>
    </Link>
  )
}

export default RepoCard
