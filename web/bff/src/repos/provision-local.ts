import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const execFileAsync = promisify(execFile)

// Local-dev equivalent of provision-on-vm.ts's SSH round-trip to
// create-repo.sh — same validation, but runs `hg init` directly against
// the bind-mounted directory hgweb-app also reads (see
// services/hg/README.md "Local dev" section and web/docker-compose.yml),
// since there's no VM to SSH into locally.
export async function provisionRepoLocally(ownerUsername: string, repoName: string): Promise<void> {
  const reposDir = process.env.HG_LOCAL_REPOS_DIR
  if (!reposDir) {
    throw new Error('HG_LOCAL_REPOS_DIR is not configured')
  }
  if (!/^[a-z0-9-]+$/.test(ownerUsername)) {
    throw new Error('invalid owner')
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(repoName)) {
    throw new Error('invalid repo name')
  }

  const ownerDir = path.join(reposDir, ownerUsername)
  const target = path.join(ownerDir, repoName)
  if (existsSync(target)) {
    throw new Error('already exists')
  }

  mkdirSync(ownerDir, { recursive: true })
  await execFileAsync('hg', ['init', target])
}

// Local-dev equivalent of deleteRepoOnVm (delete-on-vm.ts) — same
// validation, but removes the directory directly instead of SSHing
// anywhere. Idempotent like delete-repo.sh: force: true doesn't throw if
// the path is already gone, so deleting an already-deleted repo succeeds.
export async function deleteRepoLocally(ownerUsername: string, repoName: string): Promise<void> {
  const reposDir = process.env.HG_LOCAL_REPOS_DIR
  if (!reposDir) {
    throw new Error('HG_LOCAL_REPOS_DIR is not configured')
  }
  if (!/^[a-z0-9-]+$/.test(ownerUsername)) {
    throw new Error('invalid owner')
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(repoName)) {
    throw new Error('invalid repo name')
  }

  const target = path.join(reposDir, ownerUsername, repoName)
  rmSync(target, { recursive: true, force: true })
}
