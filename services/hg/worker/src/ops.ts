import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const execFileAsync = promisify(execFile)

// Ported near-verbatim from the BFF's old provision-local.ts/land-local.ts
// (the local-dev-only direct-fs implementations that used to run inside the
// BFF process) — this container is now the one and only place this logic
// runs, for both the prod and test VM stacks. Re-validates owner/repo/node
// independently of the BFF's own validation, same reasoning the old SSH
// forced-command scripts used: this is the thing actually touching the
// filesystem.
function validateOwner(owner: string): void {
  if (!/^[a-z0-9-]+$/.test(owner)) throw new Error('invalid owner')
}

function validateRepo(repo: string): void {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(repo)) throw new Error('invalid repo name')
}

function validateNode(node: string): void {
  if (!/^[0-9a-f]{12,40}$/.test(node)) throw new Error('invalid node')
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

  // Seed a public root commit so a user's own first pushed commit is never
  // itself the repo's parentless rev 0. `ch submit` (cli/src/commands/
  // submit.ts) metaedits every *draft* commit in the working copy's stack to
  // stamp a Review-Id trailer — rewriting a commit with no parent produces a
  // brand-new, unrelated root rather than a linked descendant, which the
  // remote then refuses ("repository is unrelated"). Marking this commit
  // public excludes it from that draft-only stack, so it's never a
  // candidate for rewriting in the first place — same reasoning as
  // landReview's local phase change below, this is a local, non-wire-
  // protocol operation, so hg_hooks.py's push-time restrictions don't apply.
  await execFileAsync('hg', ['commit', '--config', 'ui.allowemptycommit=true', '-u', 'CodeHub <noreply@codehub>', '-m', 'Initial commit'], {
    cwd: target,
  })
  await execFileAsync('hg', ['phase', '--public', '-r', '0'], { cwd: target })
}

// Idempotent: deleting something already gone is success, not an error, so
// retries and races are safe (matches the old delete-repo.sh's behavior).
export async function deleteRepo(reposDir: string, owner: string, repo: string): Promise<void> {
  validateOwner(owner)
  validateRepo(repo)

  const target = path.join(reposDir, owner, repo)
  rmSync(target, { recursive: true, force: true })
}

// Fast-forwards master onto `node` if it builds directly on master's tip;
// otherwise grafts (cherry-picks) it instead of rebasing — graft never
// touches/strips the source changeset, so the review page's pinned headNode
// stays resolvable forever regardless of how landing rewrote it. Returns the
// resulting node on master.
export async function landReview(reposDir: string, owner: string, repo: string, node: string): Promise<string> {
  validateOwner(owner)
  validateRepo(repo)
  validateNode(node)

  const cwd = path.join(reposDir, owner, repo)

  const hg = async (args: string[]): Promise<string> => {
    const { stdout } = await execFileAsync('hg', args, { cwd })
    return stdout.trim()
  }

  await hg(['log', '-r', node, '-T', '{node}']) // throws if unknown

  const masterNode = await hg(['log', '-r', 'bookmark(master)', '-T', '{node}']).catch(() => '')

  if (!masterNode) {
    // First-ever land for this repo — nothing to graft onto.
    await hg(['update', '--clean', '-r', node])
    await hg(['bookmark', '-f', 'master', '-r', node])
  } else {
    const parentNode = await hg(['log', '-r', `p1(${node})`, '-T', '{node}'])
    if (parentNode === masterNode) {
      // Fast-forward: node already builds directly on master's tip.
      await hg(['update', '--clean', '-r', node])
      await hg(['bookmark', '-f', 'master', '-r', node])
    } else {
      // master moved on — graft instead.
      await hg(['update', '--clean', '-r', 'bookmark(master)'])
      try {
        await hg(['graft', node])
      } catch (err) {
        await hg(['graft', '--abort']).catch(() => {})
        throw new Error(
          `graft conflict — base has diverged too far, needs a manual rebase and resubmit: ${
            err instanceof Error ? err.message : String(err)
          }`,
        )
      }
      await hg(['bookmark', '-f', 'master', '-r', '.'])
    }
  }

  await hg(['phase', '--public', '-r', 'bookmark(master)'])
  return hg(['log', '-r', 'bookmark(master)', '-T', '{node}'])
}
