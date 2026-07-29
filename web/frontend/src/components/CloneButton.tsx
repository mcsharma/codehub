import { useState } from 'react'
import { SquareTerminal, ChevronDown, Copy } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { Input } from './ui/input'

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

const CloneButton = ({ ownerUsername, repoName }: CloneButtonProps) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const cloneUrl = `${HG_PROTOCOL}://${HG_HOST}/${ownerUsername}/${repoName}`
  const cloneCommand = `hg clone ${cloneUrl}`

  const handleCopy = () => {
    navigator.clipboard.writeText(cloneCommand).then(() => setCopied(true))
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setCopied(false)
      }}
    >
      <PopoverTrigger
        render={
          <Button>
            <SquareTerminal className="size-4" />
            Clone
            <ChevronDown className="size-4" />
          </Button>
        }
      />
      <PopoverContent align="end" arrow={false} className="w-[380px]">
        <p className="mb-3 text-sm font-bold">Clone this repository</p>
        <div className="flex items-center gap-2">
          <Input
            value={cloneCommand}
            readOnly
            onFocus={(e) => e.target.select()}
            inputContainerClassName="flex-1 min-w-0"
            className="bg-background font-mono text-[0.8125rem]"
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Copy clone command"
                  onClick={handleCopy}
                >
                  <Copy className="size-4" />
                </Button>
              }
            />
            <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
          </Tooltip>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          When prompted for a password, use a{' '}
          <a href="/settings/tokens" className="text-primary hover:underline">
            personal access token
          </a>
          .
        </p>
      </PopoverContent>
    </Popover>
  )
}

export default CloneButton
