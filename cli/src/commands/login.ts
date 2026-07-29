import { saveConfig } from '../config.ts'

export async function login(args: string[]): Promise<void> {
  const server = args[0]?.replace(/\/$/, '')
  if (!server) {
    console.error('Usage: ch login <server-url> [token]')
    Deno.exit(1)
  }

  // Token as a second positional arg supports scripted/CI logins — Deno's
  // prompt() unconditionally returns null on non-TTY stdin, so piping a
  // token in wouldn't work otherwise.
  let token: string | undefined = args[1]
  if (!token) {
    token = prompt('Personal access token (create one at <server>/settings/tokens):') ?? undefined
  }
  if (!token?.trim()) {
    console.error('No token provided')
    Deno.exit(1)
  }

  await saveConfig({ server, token: token.trim() })
  console.log(`Logged in to ${server}`)
}
