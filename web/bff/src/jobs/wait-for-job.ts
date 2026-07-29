import { GraphQLError } from 'graphql'
import { boss } from './boss.js'

// Provisioning/deletion are now executed by the VM worker (see
// pothos/schema/hg-worker.ts's claim/complete/fail mutations) instead of an
// in-process SSH/local-fs call — but create_repository/delete_repository
// still want to return only once the on-disk side is actually done, matching
// today's UX (a created repo is immediately clone-able). This polls the job's
// pg-boss state instead of awaiting a direct call. Ops are sub-second in
// practice; the timeout is a generous backstop, not the expected path.
const POLL_INTERVAL_MS = 200
const DEFAULT_TIMEOUT_MS = 15_000

export async function waitForHgJob(queue: string, jobId: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const job = await boss.getJobById(queue, jobId)
    if (job?.state === 'completed') return
    if (job?.state === 'failed') {
      const output = job.output as { error?: string } | null
      throw new GraphQLError(output?.error ?? 'Operation failed')
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }
  throw new GraphQLError('Operation timed out waiting for the VM worker')
}
