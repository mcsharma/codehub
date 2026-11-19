import { graphqlRequest } from './graphql-client.js'
import { provisionRepo, deleteRepo } from './ops.js'

const REPOS_DIR = process.env.HG_WORKER_REPOS_DIR
if (!REPOS_DIR) throw new Error('HG_WORKER_REPOS_DIR is not set')

const QUEUES = ['provision-repo', 'delete-repo']
const POLL_INTERVAL_MS = 1000

interface HgJob {
  id: string
  queue: string
  owner: string
  repo: string
}

const CLAIM_MUTATION = `
  mutation ClaimHgJob($queues: [String!]!) {
    claim_hg_job(queues: $queues) { id queue owner repo }
  }
`

const COMPLETE_MUTATION = `
  mutation CompleteHgJob($job_id: ID!, $queue: String!) {
    complete_hg_job(job_id: $job_id, queue: $queue)
  }
`

const FAIL_MUTATION = `
  mutation FailHgJob($job_id: ID!, $queue: String!, $error: String!) {
    fail_hg_job(job_id: $job_id, queue: $queue, error: $error)
  }
`

async function runJob(job: HgJob): Promise<void> {
  switch (job.queue) {
    case 'provision-repo':
      return provisionRepo(REPOS_DIR as string, job.owner, job.repo)
    case 'delete-repo':
      return deleteRepo(REPOS_DIR as string, job.owner, job.repo)
    default:
      throw new Error(`unknown queue: ${job.queue}`)
  }
}

async function tick(): Promise<void> {
  const { claim_hg_job: job } = await graphqlRequest<{ claim_hg_job: HgJob | null }>(CLAIM_MUTATION, {
    queues: QUEUES,
  })
  if (!job) return

  console.log(`claimed ${job.queue} job ${job.id} (${job.owner}/${job.repo})`)
  try {
    await runJob(job)
    await graphqlRequest(COMPLETE_MUTATION, { job_id: job.id, queue: job.queue })
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
  console.log(`hg worker starting — repos dir ${REPOS_DIR}, BFF ${process.env.BFF_GRAPHQL_URL}`)
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
