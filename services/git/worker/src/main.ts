import { graphqlRequest } from './graphql-client.js'
import { provisionGitRepo, deleteGitRepo, landGitReview } from './ops.js'

const REPOS_DIR = process.env.GIT_WORKER_REPOS_DIR
if (!REPOS_DIR) throw new Error('GIT_WORKER_REPOS_DIR is not set')

const QUEUES = ['git-provision-repo', 'git-delete-repo', 'git-land-review']
const POLL_INTERVAL_MS = 1000

interface GitJob {
  id: string
  queue: string
  owner: string
  repo: string
  sha: string | null
}

const CLAIM_MUTATION = `
  mutation ClaimGitJob($queues: [String!]!) {
    claim_git_job(queues: $queues) { id queue owner repo sha }
  }
`

const COMPLETE_MUTATION = `
  mutation CompleteGitJob($job_id: ID!, $queue: String!, $landed_sha: String) {
    complete_git_job(job_id: $job_id, queue: $queue, landed_sha: $landed_sha)
  }
`

const FAIL_MUTATION = `
  mutation FailGitJob($job_id: ID!, $queue: String!, $error: String!) {
    fail_git_job(job_id: $job_id, queue: $queue, error: $error)
  }
`

// Returns the landed sha for a git-land-review job (echoed back via
// complete_git_job's landed_sha), or undefined for provision/delete.
async function runJob(job: GitJob): Promise<string | undefined> {
  switch (job.queue) {
    case 'git-provision-repo':
      await provisionGitRepo(REPOS_DIR as string, job.owner, job.repo)
      return undefined
    case 'git-delete-repo':
      await deleteGitRepo(REPOS_DIR as string, job.owner, job.repo)
      return undefined
    case 'git-land-review':
      if (!job.sha) throw new Error('git-land-review job is missing a sha')
      return landGitReview(REPOS_DIR as string, job.owner, job.repo, job.sha)
    default:
      throw new Error(`unknown queue: ${job.queue}`)
  }
}

async function tick(): Promise<void> {
  const { claim_git_job: job } = await graphqlRequest<{ claim_git_job: GitJob | null }>(CLAIM_MUTATION, {
    queues: QUEUES,
  })
  if (!job) return

  console.log(`claimed ${job.queue} job ${job.id} (${job.owner}/${job.repo})`)
  try {
    const landedSha = await runJob(job)
    await graphqlRequest(COMPLETE_MUTATION, { job_id: job.id, queue: job.queue, landed_sha: landedSha ?? null })
    console.log(`completed ${job.queue} job ${job.id}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`failed ${job.queue} job ${job.id}: ${message}`)
    await graphqlRequest(FAIL_MUTATION, { job_id: job.id, queue: job.queue, error: message }).catch((reportErr) => {
      // If even reporting the failure fails, the job just sits claimed until
      // pg-boss's own expiry reclaims it — log and move on rather than crash
      // the poll loop over it.
      console.error(`also failed to report failure for job ${job.id}:`, reportErr)
    })
  }
}

async function main(): Promise<void> {
  console.log(`git worker starting — repos dir ${REPOS_DIR}, BFF ${process.env.BFF_GRAPHQL_URL}`)
  for (;;) {
    try {
      await tick()
    } catch (err) {
      console.error('poll tick failed:', err)
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}

main()
