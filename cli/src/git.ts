import { loadConfig } from './config.ts'

export class GitError extends Error {}

interface RunResult {
  code: number
  stdout: string
  stderr: string
}

async function run(bin: 'sl' | 'git', args: string[]): Promise<RunResult> {
  const command = new Deno.Command(bin, { args, stdout: 'piped', stderr: 'piped' })
  const { code, stdout, stderr } = await command.output()
  return { code, stdout: new TextDecoder().decode(stdout), stderr: new TextDecoder().decode(stderr) }
}

// Local stack operations (log/amend) go through `sl` — Sapling's
// auto-restacking is the whole reason to prefer it over plain `git` here
// (see amend() below). Network operations go through plain `git` (see
// pushToReviewRef) since the ref we push is a deterministic, literal
// `refs/reviews/<sha>` name that doesn't need sl's own remote-bookmark
// translation.
async function sl(args: string[]): Promise<string> {
  const { code, stdout, stderr } = await run('sl', args)
  if (code !== 0) {
    throw new GitError(stderr.trim() || `sl ${args.join(' ')} failed (exit ${code})`)
  }
  return stdout
}

export async function remoteUrl(): Promise<URL> {
  const raw = (await sl(['paths', 'default'])).trim()
  if (!raw) {
    throw new Error('No "default" path configured — run this from an sl/git clone of a CodeHub repo')
  }
  return new URL(raw)
}

// owner/repo come from the remote path, not from CLI config — same
// reasoning as hg.ts's currentRepo().
export async function currentRepo(): Promise<{ owner: string; repo: string }> {
  const url = await remoteUrl()
  const [owner, repo] = url.pathname.split('/').filter(Boolean)
  if (!owner || !repo) {
    throw new Error(`Could not parse owner/repo out of sl's default path: ${url}`)
  }
  return { owner, repo }
}

export interface GitLogEntry {
  node: string
  desc: string
  parents: string[]
}

// Sapling's templater is hg-compatible, including `-T json` list output —
// verify the exact field set (node/desc/parents) against a real `sl`
// install; adjust the template here if the schema differs.
export async function log(revset: string): Promise<GitLogEntry[]> {
  const out = await sl(['log', '-T', 'json', '-r', revset])
  return out.trim() ? JSON.parse(out) : []
}

export async function pull(): Promise<void> {
  await sl(['pull'])
}

// Reword + auto-restack descendants onto the new hash. This is Sapling's
// core value-add over plain git here: hg.ts needs a separate `hg evolve`
// step after `hg metaedit` (see submit-hg.ts) because restacking isn't
// automatic; Sapling restacks as part of the amend itself. Needs
// verification against a real `sl` install — `metaedit` targeting a
// specific non-current revision via `-r` is assumed to work the same way
// it does for hg (Sapling is a superset of hg's command surface), but
// hasn't been confirmed here.
export async function amend(rev: string, message: string): Promise<void> {
  await sl(['metaedit', '-r', rev, '-m', message])
}

// The git/Sapling analog of hg's `hg prune -r <node> -s <landed> && hg
// evolve --any --all` (see sync-hg.ts): records that `node` was superseded
// by `landedNode` (already on the server via the landing worker's own
// commit-tree/update-ref — see services/git/worker/src/ops.ts) and
// restacks whatever's left on top of it. Flagged in the plan as the
// highest-uncertainty piece — confirm `prune -s` and `restack` behave as
// expected on a git-backed Sapling repo before relying on this.
export async function pruneAndRestack(node: string, landedNode: string): Promise<void> {
  await sl(['prune', '-r', node, '-s', landedNode])
  await sl(['restack']).catch(() => {}) // nothing left to restack is not an error
}

// Two layouts exist depending on how the repo was set up. Adopting an
// existing `git clone` by just running `sl` commands inside it (the
// expected git-repo workflow — see cli/README.md) keeps the ordinary
// top-level `.git` as the store. `sl clone --git` against a bare remote
// instead creates no top-level `.git` at all — the store lives at
// `<root>/.sl/store/<contents of .sl/store/gitdir>` (that indirection file
// exists because Sapling doesn't always name it "git"). Plain `git` needs
// `--git-dir` pointed at whichever one is actually present.
async function gitStoreDir(): Promise<string> {
  const root = (await sl(['root'])).trim()
  try {
    await Deno.stat(`${root}/.git`)
    return `${root}/.git`
  } catch {
    // fall through to the `sl clone --git` layout
  }
  const gitdir = (await Deno.readTextFile(`${root}/.sl/store/gitdir`)).trim()
  return `${root}/.sl/store/${gitdir}`
}

// Plain `git push`, not `sl push` — the ref we push is a deterministic,
// literal `refs/reviews/<sha>` name that doesn't need sl's own
// remote-bookmark translation (`sl push --to` maps to git *branches*, not
// arbitrary refs). The git store has no registered "origin" remote either
// (Sapling manages `paths` itself, not git's own remote config) — so this
// pushes straight to a URL built from `sl paths default`.
//
// Credentials go in the URL (Basic auth), not a Bearer header — confirmed
// against a real push that /internal/auth-check (the nginx auth_request
// gate in front of git-http-backend, see web/bff/src/index.ts) only
// accepts `Authorization: Basic ...`; `Bearer` is what the *GraphQL*
// endpoint accepts and is silently rejected here. Never persisted into
// `sl paths`/git config — reconstructed fresh per call, same as hg.ts's
// hgNetwork().
export async function pushToReviewRef(node: string): Promise<string> {
  const { token } = await loadConfig()
  const url = await remoteUrl()
  const destination = `${url.protocol}//${url.username || 'codehub'}:${token}@${url.host}${url.pathname}`
  const gitDir = await gitStoreDir()

  const { code, stdout, stderr } = await run('git', [
    '--git-dir',
    gitDir,
    'push',
    destination,
    `${node}:refs/reviews/${node}`,
  ])
  // Returns combined stdout+stderr, regardless of exit code, so the caller
  // can regex the post-receive hook's "D<n>: <url>" echo out of it — git
  // relays hook stdout to the client prefixed with its own "remote: ",
  // stacking on top of the hook's own literal "remote: " prefix (confirmed:
  // the real reply reads "remote: remote: D1: ..."), so the search is
  // deliberately not anchored to a specific prefix.
  const combined = stdout + stderr
  if (code !== 0) {
    throw new GitError(combined.trim() || `git push failed (exit ${code})`)
  }
  return combined
}
