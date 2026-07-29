import { login } from './commands/login.ts'
import { submit } from './commands/submit.ts'
import { land } from './commands/land.ts'
import { sync } from './commands/sync.ts'
import { status } from './commands/status.ts'

const USAGE = `ch — CodeHub code review CLI

Usage:
  ch login <server-url>   Save a personal access token for a CodeHub server
  ch submit                Submit the current draft commit stack for review
  ch land [D<number>]      Land a review onto master (defaults to the current commit's review)
  ch sync                  Pull, drop locally-landed commits, restack the remainder
  ch status                Show the local stack and each commit's review status
`

async function main(): Promise<void> {
  const [command, ...rest] = Deno.args
  switch (command) {
    case 'login':
      await login(rest)
      return
    case 'submit':
      await submit()
      return
    case 'land':
      await land(rest)
      return
    case 'sync':
      await sync()
      return
    case 'status':
      await status()
      return
    default:
      console.error(USAGE)
      Deno.exit(command ? 1 : 0)
  }
}

try {
  await main()
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err))
  Deno.exit(1)
}
