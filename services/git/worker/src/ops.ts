import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const execFileAsync = promisify(execFile)

// Git-native counterpart to services/hg/worker/src/ops.ts. Re-validates
// owner/repo independently of the BFF's own validation, same reasoning
// the hg worker uses: this is the thing actually touching the filesystem.
function validateOwner(owner: string): void {
  if (!/^[a-z0-9-]+$/.test(owner)) throw new Error('invalid owner')
}

function validateRepo(repo: string): void {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(repo)) throw new Error('invalid repo name')
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
  // --initial-branch=master pins HEAD explicitly rather than depending on
  // the container's init.defaultBranch config — the browse service
  // (services/git/browse) shows refs/heads/master, and pre-receive protects
  // it from deletion.
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
