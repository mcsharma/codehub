import * as stylex from '@stylexjs/stylex'
import { Link } from 'react-router'
import { cardStyles } from '../ui/Card'
import { Heading } from '../ui/Heading'
import { Text } from '../ui/Text'
import StatusBadge from './StatusBadge'
import { formatRelativeTime } from '../utils/formatters'
import { colors, space } from '../theme/tokens.stylex'

interface RepoCardProps {
  ownerUsername: string
  name: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE'
  updatedTime: number
}

const styles = stylex.create({
  card: {
    padding: space[3],
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    textDecoration: 'none',
    color: 'inherit',
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: '150ms',
    ':hover': {
      borderColor: colors.brandSolid,
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
    },
  },
  top: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  monogram: {
    width: '44px',
    height: '44px',
    borderRadius: '36px', // theme.ts's `sx={{ borderRadius: 3 }}` * shape.borderRadius (12)
    backgroundColor: colors.info,
    color: colors.brandSolid,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '700',
  },
  name: {
    marginBottom: space[1],
  },
  description: {
    flex: 1,
    marginBottom: space[2],
  },
  updated: {
    paddingTop: space[2],
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    display: 'flex',
    justifyContent: 'flex-end',
  },
})

const RepoCard = ({ ownerUsername, name, description, visibility, updatedTime }: RepoCardProps) => (
  <Link to={`/${ownerUsername}/${name}`} {...stylex.props(...cardStyles(), styles.card)}>
    <div {...stylex.props(styles.top)}>
      <div {...stylex.props(styles.monogram)}>{name.slice(0, 2).toUpperCase()}</div>
      <StatusBadge
        label={visibility === 'PUBLIC' ? 'Public' : 'Private'}
        tone={visibility === 'PUBLIC' ? 'neutral' : 'primary'}
      />
    </div>
    <Heading as="h3" size="lg" xstyle={styles.name}>
      {name}
    </Heading>
    <Text size="sm" color="muted" xstyle={styles.description}>
      {description ?? 'No description provided.'}
    </Text>
    <div {...stylex.props(styles.updated)}>
      <Text as="span" size="xs" color="muted" weight="bold">
        Updated {formatRelativeTime(updatedTime)}
      </Text>
    </div>
  </Link>
)

export default RepoCard
