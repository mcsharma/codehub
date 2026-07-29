import { PgBoss } from 'pg-boss'

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
