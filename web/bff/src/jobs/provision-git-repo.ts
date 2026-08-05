import { boss, startBoss } from './boss.js'
import { waitForHgJob } from './wait-for-job.js'
import { GIT_PROVISION_REPO_QUEUE } from './queues.js'

interface ProvisionGitRepoJobData {
  owner: string
  repo: string
}

// Git-kind counterpart to provision-repo.ts — claimed and executed by
// services/git/worker/ instead of services/hg/worker/. Reuses waitForHgJob
// as-is (it's already queue-name-parameterized with no hg-specific logic).
export async function enqueueProvisionGitRepo(owner: string, repo: string): Promise<void> {
  await startBoss()
  const jobId = await boss.send(GIT_PROVISION_REPO_QUEUE, { owner, repo } satisfies ProvisionGitRepoJobData)
  if (!jobId) {
    throw new Error('Failed to enqueue git-provision-repo job')
  }
  await waitForHgJob(GIT_PROVISION_REPO_QUEUE, jobId)
}
