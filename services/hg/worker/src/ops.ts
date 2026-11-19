import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const execFileAsync = promisify(execFile)

// Ported near-verbatim from the BFF's old provision-local.ts
// (the local-dev-only direct-fs implementations that used to run inside the
// BFF process) — this container is now the one and only place this logic
// runs, for both the prod and test VM stacks. Re-validates owner/repo
// independently of the BFF's own validation, same reasoning the old SSH
// forced-command scripts used: this is the thing actually touching the
// filesystem.
function validateOwner(owner: string): void {
  if (!/^[a-z0-9-]+$/.test(owner)) throw new Error('invalid owner')
}

function validateRepo(repo: string): void {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(repo)) throw new Error('invalid repo name')
}

export async function provisionRepo(reposDir: string, owner: string, repo: string): Promise<void> {
  validateOwner(owner)
  validateRepo(repo)

  const ownerDir = path.join(reposDir, owner)
  const target = path.join(ownerDir, repo)
  if (existsSync(target)) {
    throw new Error('already exists')
  }

  mkdirSync(ownerDir, { recursive: true })
  await execFileAsync('hg', ['init', target])
}

// Idempotent: deleting something already gone is success, not an error, so
// retries and races are safe (matches the old delete-repo.sh's behavior).
export async function deleteRepo(reposDir: string, owner: string, repo: string): Promise<void> {
  validateOwner(owner)
  validateRepo(repo)

  const target = path.join(reposDir, owner, repo)
  rmSync(target, { recursive: true, force: true })
}

