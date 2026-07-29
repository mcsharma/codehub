import { boss, startBoss } from './boss.js'
import { LAND_REVIEW_QUEUE } from './queues.js'

interface LandReviewJobData {
  // BigInt isn't JSON-serializable, so the review id crosses the job queue
  // as a string.
  reviewId: string
}

// Landing stays fire-and-forget async, same as before this file stopped
// executing jobs in-process — the difference now is *who* claims and runs
// the job: the VM worker, via claim_hg_job/complete_hg_job/fail_hg_job (see
// pothos/schema/hg-worker.ts), not a boss.work() loop inside this process.
// That resolver is also what resolves reviewId -> owner/repo/headNode and
// writes the LANDED/LAND_FAILED status back, mirroring what this file used
// to do inline.
export async function enqueueLandReview(reviewId: bigint): Promise<void> {
  await startBoss()
  await boss.send(LAND_REVIEW_QUEUE, { reviewId: String(reviewId) } satisfies LandReviewJobData)
}
