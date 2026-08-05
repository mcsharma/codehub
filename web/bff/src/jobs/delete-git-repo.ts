import { boss, startBoss } from './boss.js'
import { waitForHgJob } from './wait-for-job.js'
import { GIT_DELETE_REPO_QUEUE } from './queues.js'

interface DeleteGitRepoJobData {
  owner: string
  repo: string
}

// See provision-git-repo.ts — same reasoning, mirrored for deletion.
export async function enqueueDeleteGitRepo(owner: string, repo: string): Promise<void> {
  await startBoss()
  const jobId = await boss.send(GIT_DELETE_REPO_QUEUE, { owner, repo } satisfies DeleteGitRepoJobData)
  if (!jobId) {
    throw new Error('Failed to enqueue git-delete-repo job')
  }
  await waitForHgJob(GIT_DELETE_REPO_QUEUE, jobId)
}
