import { detectVcs } from '../vcs.ts'
import { statusHg } from './status-hg.ts'
import { statusGit } from './status-git.ts'

export async function status(): Promise<void> {
  const vcs = await detectVcs()
  if (vcs === 'git') return statusGit()
  return statusHg()
}
