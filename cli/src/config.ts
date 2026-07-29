// ~/.config/codehub/config.json — { server, token }. `server` is the
// CodeHub web/API host (e.g. https://www.greensnippet.com), which is
// deliberately NOT derived from `hg paths default` (that points at the hg
// wire-protocol host, e.g. hg.greensnippet.com — a different subdomain in
// this deployment, and there's no reliable naming convention to derive one
// from the other across future self-hosted/enterprise setups). owner/repo
// are still derived from the hg remote — see hg.ts's currentRepo().

export interface Config {
  server: string
  token: string
}

function configPath(): string {
  const home = Deno.env.get('HOME')
  if (!home) throw new Error('HOME is not set')
  return `${home}/.config/codehub/config.json`
}

export async function loadConfig(): Promise<Config> {
  const path = configPath()
  try {
    return JSON.parse(await Deno.readTextFile(path))
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      throw new Error(`Not logged in — run "ch login <server-url>" first (expected config at ${path})`)
    }
    throw err
  }
}

export async function saveConfig(config: Config): Promise<void> {
  const path = configPath()
  await Deno.mkdir(path.slice(0, path.lastIndexOf('/')), { recursive: true })
  await Deno.writeTextFile(path, JSON.stringify(config, null, 2) + '\n')
  // Config holds a bearer token in plaintext — same posture as any other
  // CLI's local token file (aws/gh/etc.): not encrypted at rest, but not
  // world-readable either.
  await Deno.chmod(path, 0o600)
}
