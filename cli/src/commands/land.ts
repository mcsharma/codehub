import { detectVcs } from '../vcs.ts'
import { landHg } from './land-hg.ts'
import { landGit } from './land-git.ts'

export async function land(args: string[]): Promise<void> {
  const vcs = await detectVcs()
  if (vcs === 'git') return landGit(args)
  return landHg(args)
}
