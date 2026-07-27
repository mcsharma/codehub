import * as stylex from '@stylexjs/stylex'
import { CircleUserRound } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { colors } from '../theme/tokens.stylex'

interface UserAvatarProps {
  size?: number
}

const styles = stylex.create({
  root: {
    backgroundColor: colors.bg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    color: colors.fgMuted,
  },
})

// No photo storage exists yet (Google profile pictures aren't persisted),
// so every avatar is this generic icon rather than a broken/missing image.
const UserAvatar = ({ size = 32 }: UserAvatarProps) => (
  <Avatar size={size} xstyle={styles.root} fallback={<CircleUserRound size={Math.round(size * 0.8)} />} />
)

export default UserAvatar
