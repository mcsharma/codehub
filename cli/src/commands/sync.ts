import { detectVcs } from '../vcs.ts'
import { syncHg } from './sync-hg.ts'
import { syncGit } from './sync-git.ts'

export async function sync(): Promise<void> {
  const vcs = await detectVcs()
  if (vcs === 'git') return syncGit()
  return syncHg()
}
