import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const execFileAsync = promisify(execFile)

const REPOS_DIR = process.env.GIT_BROWSE_REPOS_DIR ?? '/data/repos'

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Re-validates owner/repo independently of the BFF's own validation, same
// reasoning as services/git/worker/src/ops.ts's identically-named helpers
// (duplicated rather than shared — this is the thing actually touching the
// filesystem).
function validateOwner(owner: string): void {
  if (!/^[a-z0-9-]+$/.test(owner)) throw new HttpError(400, 'invalid owner')
}

function validateRepo(repo: string): void {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(repo)) throw new HttpError(400, 'invalid repo name')
}

// git treats a leading "-" as an option flag, not a revision/path — reject
// outright rather than risk a query param being interpreted as e.g. an
// `--upload-pack` flag.
function validateRevOrPath(value: string, label: string): void {
  if (!value || value.startsWith('-')) throw new HttpError(400, `invalid ${label}`)
}

function repoDir(owner: string, repo: string): string {
  validateOwner(owner)
  validateRepo(repo)
  return path.join(REPOS_DIR, owner, repo)
}

async function git(gitDir: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync('git', ['--git-dir', gitDir, ...args])
    return stdout
  } catch (err) {
    throw new HttpError(404, err instanceof Error ? err.message : String(err))
  }
}

// Field/shape-compatible with web/bff/src/repos/hgweb-client.ts's
// HgChangeset — that's deliberate, see git-browse-client.ts.
export interface RawCommit {
  node: string
  date: [number, number]
  desc: string
  branch: string
  bookmarks: string[]
  tags: string[]
  user: string
  phase: string
  parents: string[]
  files?: { file: string; status: string }[]
}

const FIELD_SEP = '\x1f' // unit separator
const RECORD_SEP = '\x1e' // record separator
// %B (the raw commit message) is deliberately the last field — it's the
// only one that can itself contain newlines, and it can't contain \x1f/\x1e.
const LOG_FORMAT = `%H${FIELD_SEP}%an <%ae>${FIELD_SEP}%at${FIELD_SEP}%P${FIELD_SEP}%B${RECORD_SEP}`

function parseCommits(stdout: string): RawCommit[] {
  return stdout
    .split(RECORD_SEP)
    .map((rec) => rec.trim())
    .filter((rec) => rec.length > 0)
    .map((rec) => {
      const [node, user, atStr, parentsStr, ...descParts] = rec.split(FIELD_SEP)
      return {
        node,
        user,
        date: [Number(atStr), 0] as [number, number],
        parents: parentsStr ? parentsStr.split(' ').filter(Boolean) : [],
        desc: descParts.join(FIELD_SEP),
        // These repos structurally have only one ref (pre-receive rejects
        // every push except refs/reviews/<sha>, see services/git/hooks/
        // pre-receive) and no tag/bookmark concept — see the plan's
        // Non-goals.
        branch: 'master',
        bookmarks: [],
        tags: [],
        phase: 'draft',
      }
    })
}

const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

async function parentOrEmptyTree(gitDir: string, sha: string): Promise<string> {
  try {
    return (await git(gitDir, ['rev-parse', '-q', '--verify', `${sha}^`])).trim()
  } catch {
    return EMPTY_TREE // root commit — diff against nothing
  }
}

// git's name-status letters collapse to hg's three-value convention — the
// frontend (CommitFileTree, CommitPage) only distinguishes added/removed,
// treating anything else (modified/renamed/copied/type-changed) as
// "modified".
function statusLetter(code: string): string {
  if (code.startsWith('A')) return 'added'
  if (code.startsWith('D')) return 'removed'
  return 'modified'
}

async function fetchFilesChanged(gitDir: string, sha: string): Promise<{ file: string; status: string }[]> {
  const parent = await parentOrEmptyTree(gitDir, sha)
  const out = await git(gitDir, ['diff', '--name-status', parent, sha])
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [code, ...fileParts] = line.split('\t')
      return { file: fileParts.join('\t'), status: statusLetter(code) }
    })
}

export async function shortlog(
  owner: string,
  repo: string,
  count: number,
  after: string | undefined,
): Promise<RawCommit[]> {
  const gitDir = repoDir(owner, repo)
  const args = ['log', `--format=${LOG_FORMAT}`, '-n', String(count)]
  if (after) {
    validateRevOrPath(after, 'after')
    // --skip=1 drops `after` itself, so callers get exactly `count` fresh
    // entries — unlike hgweb's /shortlog/<node>, which returns <node>
    // itself as the first entry (an "inclusive starting point," not an
    // "after" cursor).
    args.push('--skip=1', after)
  } else {
    args.push('refs/heads/master')
  }
  const out = await git(gitDir, args)
  return parseCommits(out)
}

export async function changeset(owner: string, repo: string, sha: string): Promise<RawCommit> {
  validateRevOrPath(sha, 'sha')
  const gitDir = repoDir(owner, repo)
  await git(gitDir, ['cat-file', '-e', `${sha}^{commit}`]) // throws HttpError(404) if unknown
  const out = await git(gitDir, ['log', '-1', `--format=${LOG_FORMAT}`, sha])
  const [commit] = parseCommits(out)
  if (!commit) throw new HttpError(404, 'commit not found')
  commit.files = await fetchFilesChanged(gitDir, sha)
  return commit
}

// git diff's output is already a clean unified diff — no "# HG changeset
// patch" preamble to strip, unlike hgweb-client.ts's fetchRawDiff.
export async function rawDiff(owner: string, repo: string, sha: string): Promise<string> {
  validateRevOrPath(sha, 'sha')
  const gitDir = repoDir(owner, repo)
  const parent = await parentOrEmptyTree(gitDir, sha)
  return git(gitDir, ['diff', parent, sha])
}

export interface RawDirectoryListing {
  directories: { abspath: string; basename: string }[]
  files: { abspath: string; basename: string; size: number; date: [number, number] }[]
}

export async function directory(
  owner: string,
  repo: string,
  rev: string,
  dirPath: string,
): Promise<RawDirectoryListing> {
  validateRevOrPath(rev, 'rev')
  const gitDir = repoDir(owner, repo)
  const treeish = dirPath ? `${rev}:${dirPath}` : `${rev}:`
  const out = await git(gitDir, ['ls-tree', '--long', treeish])

  const directories: RawDirectoryListing['directories'] = []
  const files: RawDirectoryListing['files'] = []
  for (const line of out.split('\n').map((l) => l.trim()).filter(Boolean)) {
    // "<mode> <type> <sha> <size-or-\"-\">\t<name>"
    const [meta, name] = line.split('\t')
    if (!meta || !name) continue
    const parts = meta.split(/\s+/)
    const type = parts[1]
    const size = parts[3]
    const abspath = dirPath ? `${dirPath}/${name}` : name
    if (type === 'tree') {
      directories.push({ abspath, basename: name })
    } else {
      files.push({ abspath, basename: name, size: size === '-' || !size ? 0 : Number(size), date: [0, 0] })
    }
  }
  return { directories, files }
}

export async function rawFile(owner: string, repo: string, rev: string, filePath: string): Promise<Buffer> {
  validateRevOrPath(rev, 'rev')
  validateRevOrPath(filePath, 'path')
  const gitDir = repoDir(owner, repo)
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['--git-dir', gitDir, 'cat-file', '-p', `${rev}:${filePath}`],
      { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 },
    )
    return stdout
  } catch (err) {
    throw new HttpError(404, err instanceof Error ? err.message : String(err))
  }
}

export async function fileLog(owner: string, repo: string, rev: string, filePath: string): Promise<RawCommit | null> {
  validateRevOrPath(rev, 'rev')
  const gitDir = repoDir(owner, repo)
  const out = await git(gitDir, ['log', '-1', `--format=${LOG_FORMAT}`, rev, '--', filePath]).catch(() => '')
  const [commit] = parseCommits(out)
  return commit ?? null
}
