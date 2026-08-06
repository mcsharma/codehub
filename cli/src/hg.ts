import { loadConfig } from './config.ts'

export class HgError extends Error {}

async function exec(args: string[]): Promise<string> {
  const command = new Deno.Command('hg', { args, stdout: 'piped', stderr: 'piped' })
  const { code, stdout, stderr } = await command.output()
  if (code !== 0) {
    const message = new TextDecoder().decode(stderr).trim()
    throw new HgError(message || `hg ${args.join(' ')} failed (exit ${code})`)
  }
  return new TextDecoder().decode(stdout)
}

export const hg = exec

export async function remoteUrl(): Promise<URL> {
  const raw = (await hg(['paths', 'default'])).trim()
  if (!raw) {
    throw new Error('No "default" path configured — run this from an hg clone of a CodeHub repo')
  }
  return new URL(raw)
}

// owner/repo come from the hg remote path, not from CLI config — a working
// copy can only ever be a clone of one repo, so there's nothing to
// configure here, unlike `server` (see config.ts).
export async function currentRepo(): Promise<{ owner: string; repo: string }> {
  const url = await remoteUrl()
  const [owner, repo] = url.pathname.split('/').filter(Boolean)
  if (!owner || !repo) {
    throw new Error(`Could not parse owner/repo out of hg's default path: ${url}`)
  }
  return { owner, repo }
}

// Runs an hg command that talks to the CodeHub server (push/pull), with the
// PAT injected as HTTP Basic auth scoped to that one host via a
// per-invocation --config override. Deliberately not written into
// HGRCPATH/the user's real hgrc — HGRCPATH replaces the whole hgrc search
// path when set, which would silently disable the user's own extension
// config (evolve, etc.); a --config flag on just this invocation can't have
// that side effect.
export async function hgNetwork(args: string[]): Promise<string> {
  const { token } = await loadConfig()
  const { host, username } = await remoteUrl()
  return exec([
    '--config',
    `auth.codehub.prefix=${host}`,
    // Mercurial's [auth] matching only applies a section when its username
    // matches the destination URL's own embedded username, if any (the
    // Clone dropdown's suggested `hg clone http://x:<token>@host/...`
    // persists `x` into `paths.default` — Mercurial strips the password on
    // save but keeps the username) — a mismatched hardcoded username here
    // makes the whole section silently ignored, surfacing as "http
    // authorization required" with no credentials even attempted. Falling
    // back to a fixed placeholder covers the (unlikely but valid) case of a
    // `default` path with no embedded username at all.
    '--config',
    `auth.codehub.username=${username || 'codehub'}`,
    '--config',
    `auth.codehub.password=${token}`,
    // hg's [auth] entries only match https by default (confirmed against a
    // real push: silently not applied, surfaced as "http authorization
    // required" with no credentials even attempted) — explicit here so
    // both prod (https) and local dev (plain http) work without the CLI
    // needing to know which environment it's in. Space-separated, per `hg
    // help config.auth` — comma-separated silently fails to match at all
    // (spent a while chasing that as a "network flakiness" red herring).
    '--config',
    'auth.codehub.schemes=http https',
    ...args,
  ])
}

// Best-effort: some hg versions print more than a bare success/failure for
// an unconfigured extension name, but `hg config extensions.evolve`
// exiting 0 vs non-zero is the simplest reliable signal across versions.
export async function hasEvolve(): Promise<boolean> {
  try {
    await exec(['config', 'extensions.evolve'])
    return true
  } catch {
    return false
  }
}

export interface HgLogEntry {
  rev: number
  node: string
  branch: string
  phase: string
  user: string
  date: [number, number]
  desc: string
  bookmarks: string[]
  tags: string[]
  parents: string[]
}

export async function log(revset: string): Promise<HgLogEntry[]> {
  const out = await hg(['log', '-T', 'json', '-r', revset])
  return out.trim() ? JSON.parse(out) : []
}

export function shortNode(node: string): string {
  return node.slice(0, 12)
}
