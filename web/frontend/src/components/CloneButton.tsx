import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { Copy } from 'lucide-react'
import { MuiTerminalIcon, MuiChevronDownIcon } from './icons/MuiIcons'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { Tooltip } from '../ui/Tooltip'
import { Text } from '../ui/Text'
import { PopoverRoot, PopoverTrigger, PopoverContent } from '../ui/Popover'
import { bareInputStyle } from '../ui/Field'
import { colors, radii, space } from '../theme/tokens.stylex'

// The hg host every repo is served from — see services/hg/ and
// web/bff/src/repos/hgweb-client.ts on the backend side. Overridden in
// local dev (VITE_HG_HOST=localhost:8000, see .env.local) to point at the
// local hgweb-proxy instead of prod's VM.
const HG_HOST = import.meta.env.VITE_HG_HOST ?? 'hg.greensnippet.com'
const HG_PROTOCOL = HG_HOST.startsWith('localhost') ? 'http' : 'https'

interface CloneButtonProps {
  ownerUsername: string
  repoName: string
}

const styles = stylex.create({
  content: {
    padding: '20px',
    width: '380px',
  },
  title: {
    marginBottom: space[1.5],
    display: 'block',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: space[1],
  },
  // Prod's clone-command input: compact padding, no background fill,
  // plain grey border — NOT the full MUI OutlinedInput look (which
  // has 16.5px padding + bgSubtle fill). Override bareInputStyle.
  // borderRadius: 0 — prod renders this with square corners (TextField
  // inside a Popover that overrides the global shape.borderRadius).
  input: {
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
    flex: 1,
    padding: '8.5px 14px',
    lineHeight: '1.4375em',
    backgroundColor: colors.bg,
    borderRadius: radii.sm,
  },
  // Prod's copy button has no surrounding border box — icon only.
  copyButton: {
    flexShrink: 0,
  },
  hint: {
    display: 'block',
    marginTop: space[1.5],
  },
  hintLink: {
    color: colors.brandSolid,
  },
})

const CloneButton = ({ ownerUsername, repoName }: CloneButtonProps) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const cloneUrl = `${HG_PROTOCOL}://${HG_HOST}/${ownerUsername}/${repoName}`
  const cloneCommand = `hg clone ${cloneUrl}`

  const handleCopy = () => {
    navigator.clipboard.writeText(cloneCommand).then(() => setCopied(true))
  }

  return (
    <PopoverRoot
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setCopied(false)
      }}
    >
      <PopoverTrigger
        render={
          <Button variant="solid">
            <MuiTerminalIcon />
            Clone
            <MuiChevronDownIcon />
          </Button>
        }
      />
      <PopoverContent xstyle={styles.content}>
        <Text as="span" weight="bold" xstyle={styles.title}>
          Clone this repository
        </Text>
        <div {...stylex.props(styles.row)}>
          <input
            value={cloneCommand}
            readOnly
            onFocus={(e) => e.target.select()}
            {...stylex.props(bareInputStyle, styles.input)}
          />
          <Tooltip content={copied ? 'Copied!' : 'Copy'}>
            <IconButton
              aria-label="Copy clone command"
              variant="ghost"
              size="md"
              onClick={handleCopy}
              xstyle={styles.copyButton}
            >
              <Copy size={20} />
            </IconButton>
          </Tooltip>
        </div>
        <Text size="xs" color="muted" xstyle={styles.hint}>
          When prompted for a password, use a{' '}
          <a href="/settings/tokens" {...stylex.props(styles.hintLink)}>
            personal access token
          </a>
          .
        </Text>
      </PopoverContent>
    </PopoverRoot>
  )
}

export default CloneButton
