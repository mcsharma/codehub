import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const execFileAsync = promisify(execFile)

// Git-native counterpart to services/hg/worker/src/ops.ts. Re-validates
// owner/repo/sha independently of the BFF's own validation, same reasoning
// the hg worker uses: this is the thing actually touching the filesystem.
function validateOwner(owner: string): void {
  if (!/^[a-z0-9-]+$/.test(owner)) throw new Error('invalid owner')
}

function validateRepo(repo: string): void {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(repo)) throw new Error('invalid repo name')
}

function validateSha(sha: string): void {
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error('invalid sha')
}

export async function provisionGitRepo(reposDir: string, owner: string, repo: string): Promise<void> {
  validateOwner(owner)
  validateRepo(repo)

  const ownerDir = path.join(reposDir, owner)
  const target = path.join(ownerDir, repo)
  if (existsSync(target)) {
    throw new Error('already exists')
  }

  mkdirSync(ownerDir, { recursive: true })
  // --initial-branch=master is load-bearing, not cosmetic: without it HEAD
  // depends on the container's init.defaultBranch config and could point at
  // an ambiguous ref, breaking landGitReview's refs/heads/master assumption
  // below.
  //
  // No seed commit (unlike provisionRepo's hg equivalent, which seeds a
  // public root commit) — the hazard that motivates hg's seed commit
  // doesn't apply here: nothing auto-rewrites a user's commits server-side
  // for git (there's no client-side ch-submit-equivalent doing an automatic
  // stack-wide amend — see report_git_review_push, which only ever reads
  // commits, never rewrites them), and `git push` has no "unrelated
  // histories" push-time rejection (that's a `git merge`/`pull` concept,
  // not push). See docs/plans/zesty-zooming-cupcake.md's "Key design
  // decisions" #4 for the full reasoning, and its Verification section for
  // the empirical check against Sapling specifically.
  await execFileAsync('git', ['init', '--bare', '--initial-branch=master', target])
}

// Idempotent: deleting something already gone is success, not an error, so
// retries and races are safe (matches deleteRepo's hg equivalent).
export async function deleteGitRepo(reposDir: string, owner: string, repo: string): Promise<void> {
  validateOwner(owner)
  validateRepo(repo)

  const target = path.join(reposDir, owner, repo)
  rmSync(target, { recursive: true, force: true })
}

const LANDING_IDENTITY_NAME = 'CodeHub'
const LANDING_IDENTITY_EMAIL = 'noreply@codehub'

// Fast-forwards master onto `sha` if it builds directly on master's tip;
// otherwise grafts (cherry-picks) it via tree-level plumbing instead of a
// working-tree cherry-pick/rebase — a bare repo has no working tree for
// `git cherry-pick` to operate against. Mirrors landReview's hg equivalent's
// fast-forward-vs-graft branching. Returns the resulting sha on master.
export async function landGitReview(reposDir: string, owner: string, repo: string, sha: string): Promise<string> {
  validateOwner(owner)
  validateRepo(repo)
  validateSha(sha)

  const cwd = path.join(reposDir, owner, repo)

  const git = async (args: string[], env?: NodeJS.ProcessEnv): Promise<string> => {
    const { stdout } = await execFileAsync('git', args, { cwd, env })
    return stdout.trim()
  }

  await git(['cat-file', '-e', `${sha}^{commit}`]) // throws if unknown

  const masterSha = await git(['rev-parse', '--verify', '-q', 'refs/heads/master']).catch(() => '')

  if (!masterSha) {
    // First-ever land for this repo — nothing to graft onto.
    await git(['update-ref', 'refs/heads/master', sha])
    return sha
  }

  const parentSha = await git(['rev-parse', '-q', '--verify', `${sha}^`]).catch(() => '')

  if (!parentSha) {
    // A root (parentless) commit can't land onto a master that already has
    // history. Should be unreachable in the normal flow — a real reviewer's
    // stack is always based on some commit they cloned, i.e. some ancestor
    // of master — so this is a loud rejection rather than a silent
    // workaround.
    throw new Error('root commit cannot land onto an existing master — rebase onto master first')
  }

  if (parentSha === masterSha) {
    // Fast-forward: sha already builds directly on master's tip.
    await git(['update-ref', 'refs/heads/master', sha])
    return sha
  }

  // Graft path: master moved since this review was based. Reproduce
  // cherry-pick's own 3-way merge inputs (base = sha's own parent,
  // ours = master's current tip, theirs = sha) at the tree level —
  // `merge-tree --write-tree` needs no working directory (git >=2.38).
  let newTree: string
  try {
    newTree = await git(['merge-tree', '--write-tree', `--merge-base=${parentSha}`, masterSha, sha])
  } catch (err) {
    throw new Error(
      `graft conflict — base has diverged too far, needs a manual rebase and resubmit: ${
        err instanceof Error ? err.message : String(err)
      }`,
    )
  }

  const message = await git(['log', '-1', '--format=%B', sha])
  // \x1f (unit separator) as the field delimiter — safe against author
  // names/emails containing spaces or other punctuation.
  const [authorName, authorEmail, authorDate] = (
    await git(['log', '-1', '--format=%an\x1f%ae\x1f%aI', sha])
  ).split('\x1f')

  // Preserves the original commit's authorship (mirrors graft's default
  // behavior) while attributing the landing commit itself to CodeHub, same
  // landing identity landReview's hg equivalent uses.
  const newSha = await git(['commit-tree', newTree, '-p', masterSha, '-m', message], {
    ...process.env,
    GIT_AUTHOR_NAME: authorName,
    GIT_AUTHOR_EMAIL: authorEmail,
    GIT_AUTHOR_DATE: authorDate,
    GIT_COMMITTER_NAME: LANDING_IDENTITY_NAME,
    GIT_COMMITTER_EMAIL: LANDING_IDENTITY_EMAIL,
  })

  // Trailing <oldvalue> gives update-ref a compare-and-swap: fails if
  // master moved concurrently between the read above and this write — a
  // small correctness improvement over landReview's hg equivalent, which
  // has no such race guard.
  await git(['update-ref', '-m', 'land review', 'refs/heads/master', newSha, masterSha])

  return newSha
}
