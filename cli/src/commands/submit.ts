import { detectVcs } from '../vcs.ts'
import { submitHg } from './submit-hg.ts'
import { submitGit } from './submit-git.ts'

export async function submit(): Promise<void> {
  const vcs = await detectVcs()
  if (vcs === 'git') return submitGit()
  return submitHg()
}
