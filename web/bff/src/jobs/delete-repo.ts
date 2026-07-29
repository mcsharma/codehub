import { boss, startBoss } from './boss.js'
import { waitForHgJob } from './wait-for-job.js'
import { DELETE_REPO_QUEUE } from './queues.js'

interface DeleteRepoJobData {
  owner: string
  repo: string
}

// See provision-repo.ts — same replace-SSH-and-local-fs-with-a-queued-job
// reasoning, mirrored for deletion.
export async function enqueueDeleteRepo(owner: string, repo: string): Promise<void> {
  await startBoss()
  const jobId = await boss.send(DELETE_REPO_QUEUE, { owner, repo } satisfies DeleteRepoJobData)
  if (!jobId) {
    throw new Error('Failed to enqueue delete-repo job')
  }
  await waitForHgJob(DELETE_REPO_QUEUE, jobId)
}
