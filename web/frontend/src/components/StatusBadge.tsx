import { Badge } from '../ui/Badge'

export type StatusBadgeTone = 'neutral' | 'primary' | 'success'

interface StatusBadgeProps {
  label: string
  tone?: StatusBadgeTone
}

const toneMap: Record<StatusBadgeTone, 'neutral' | 'brand' | 'success'> = {
  neutral: 'neutral',
  primary: 'brand',
  success: 'success',
}

// Small recurring pill pattern across the app (Public/Private, token
// Active/Never used) — one place to keep the uppercase/weight/color
// styling consistent instead of repeating it per page.
const StatusBadge = ({ label, tone = 'neutral' }: StatusBadgeProps) => (
  <Badge tone={toneMap[tone]}>{label}</Badge>
)

export default StatusBadge
