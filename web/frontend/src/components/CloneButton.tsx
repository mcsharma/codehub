import { useState } from 'react'
import { SquareTerminal, ChevronDown, Copy } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { Input } from './ui/input'

// The hg host every repo is served from — see services/hg/ and
// web/bff/src/repos/hgweb-client.ts on the backend side. Overridden in
// local dev (VITE_HG_HOST=<vm-ip>:8001, see .env.local) to point at the
// VM's test hgweb-proxy instead of prod's.
const HG_HOST = import.meta.env.VITE_HG_HOST ?? 'hg.greensnippet.com'
// The git host every git-kind repo is served from — see services/git/.
// Prod's default deliberately includes a port (git.greensnippet.com:8443,
// not a bare domain like hg's) — see docs/plans/zesty-zooming-cupcake.md's
// "Key design decisions" #3 for why git prod isn't on 443.
const GIT_HOST = import.meta.env.VITE_GIT_HOST ?? 'git.greensnippet.com:8443'

// Whether a host needs plain http (the VM's test-stack proxies, reached
// directly by IP:port, have no TLS cert to terminate with) or https (any
// real domain, prod or otherwise — including git's prod host, which has a
// port *and* still needs TLS, unlike hg's "a port means no TLS" case). A
// bare IP is the actual signal, not "has a port" — git's non-standard prod
// port would otherwise be misread as the local/test case.
const isBareIpHost = (host: string) => /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host)
const HG_PROTOCOL = isBareIpHost(HG_HOST) ? 'http' : 'https'
const GIT_PROTOCOL = isBareIpHost(GIT_HOST) ? 'http' : 'https'

interface CloneButtonProps {
  ownerUsername: string
  repoName: string
  vcsKind: 'HG' | 'GIT'
}

const CloneButton = ({ ownerUsername, repoName, vcsKind }: CloneButtonProps) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // A fixed placeholder, not the viewer's real username — the server
  // ignores Basic auth's username entirely (see web/bff/src/index.ts's
  // /internal/auth-check: only what's after the first colon, the token,
  // is checked), so any value works identically. Embedding one here just
  // saves a round trip: both hg and git only prompt interactively for
  // whatever credential piece is missing, so a URL with a username but no
  // password goes straight to "password:" instead of asking for both. Must
  // match cli/src/hg.ts's hgNetwork() fallback so `ch submit` and a clone
  // from this URL resolve to the same Mercurial [auth] section (git has no
  // equivalent client-side config to keep in sync with, since there's no
  // custom CLI for git repos — see services/git/README.md).
  const cloneCommand =
    vcsKind === 'GIT'
      ? `git clone ${GIT_PROTOCOL}://codehub@${GIT_HOST}/${ownerUsername}/${repoName}`
      : `hg clone ${HG_PROTOCOL}://codehub@${HG_HOST}/${ownerUsername}/${repoName}`

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
