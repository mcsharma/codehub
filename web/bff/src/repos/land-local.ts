import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const execFileAsync = promisify(execFile)

// Local-dev equivalent of land-on-vm.ts's SSH round-trip to
// land-review.sh — same algorithm, run directly against the bind-mounted
// repo directory instead of SSHing anywhere (see
// services/hg/README.md "Local dev" section).
export async function landReviewLocally(ownerUsername: string, repoName: string, node: string): Promise<string> {
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
  if (!/^[0-9a-f]{12,40}$/.test(node)) {
    throw new Error('invalid node')
  }

  const cwd = path.join(reposDir, ownerUsername, repoName)

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
      // master moved on — graft (cherry-pick) instead. graft never
      // touches/strips the source changeset, so the review page's pinned
      // headNode stays resolvable forever regardless of how landing
      // rewrote it.
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
