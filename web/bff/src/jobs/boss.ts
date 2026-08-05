import { PgBoss } from 'pg-boss'
import { HG_JOB_QUEUES, GIT_JOB_QUEUES } from './queues.js'

// First background-job infrastructure in this codebase — everything else
// privileged (repo provisioning/deletion) runs synchronously inside a
// resolver. Landing needs to be async instead (see
// src/jobs/land-review.ts): a live SSH+hg graft shouldn't block a GraphQL
// request/response cycle. Postgres-backed rather than a separate broker —
// no new infra to run alongside the BFF, same DATABASE_URL it already has.
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

export const boss = new PgBoss(connectionString)

let started: Promise<void> | null = null

// Idempotent so any module that needs to enqueue/register work can call
// this without coordinating a single "boot" call site.
export function startBoss(): Promise<void> {
  if (!started) {
    started = boss.start().then(() => undefined)
  }
  return started
}

// Queues must exist before send()/fetch() will work against them. Nothing
// in this process runs boss.work() anymore (see jobs/land-review.ts) — the
// VM worker is the sole consumer, via claim_hg_job — so this is the only
// place left that needs to ensure the queues themselves exist. Called once
// from index.ts at boot, after startBoss().
export async function ensureHgQueues(): Promise<void> {
  for (const queue of HG_JOB_QUEUES) {
    await boss.createQueue(queue)
  }
}

// Same as ensureHgQueues, for the git-kind job queues (see
// pothos/schema/git-worker.ts). Called once from index.ts at boot, after
// startBoss(), alongside the existing ensureHgQueues() call.
export async function ensureGitQueues(): Promise<void> {
  for (const queue of GIT_JOB_QUEUES) {
    await boss.createQueue(queue)
  }
}
