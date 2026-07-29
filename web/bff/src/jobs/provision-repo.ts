import { boss, startBoss } from './boss.js'
import { waitForHgJob } from './wait-for-job.js'
import { PROVISION_REPO_QUEUE } from './queues.js'

interface ProvisionRepoJobData {
  owner: string
  repo: string
}

// Replaces the old provisionRepoOnVm (SSH)/provisionRepoLocally
// (direct-fs-in-BFF-process) split — both local dev and prod now enqueue the
// same job, claimed and executed by whichever environment's VM worker stack
// polls this BFF (see pothos/schema/hg-worker.ts). Waits for completion so
// create_repository's return-once-it-exists behavior is unchanged.
export async function enqueueProvisionRepo(owner: string, repo: string): Promise<void> {
  await startBoss()
  const jobId = await boss.send(PROVISION_REPO_QUEUE, { owner, repo } satisfies ProvisionRepoJobData)
  if (!jobId) {
    throw new Error('Failed to enqueue provision-repo job')
  }
  await waitForHgJob(PROVISION_REPO_QUEUE, jobId)
}
