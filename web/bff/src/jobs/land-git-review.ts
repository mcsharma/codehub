import { boss, startBoss } from './boss.js'
import { GIT_LAND_REVIEW_QUEUE } from './queues.js'

interface LandGitReviewJobData {
  // BigInt isn't JSON-serializable, so the review id crosses the job queue
  // as a string.
  reviewId: string
}

// Git-kind counterpart to land-review.ts — fire-and-forget, same as the hg
// version. claim_git_job/complete_git_job/fail_git_job (see
// pothos/schema/git-worker.ts) resolve reviewId -> owner/repo/headNode and
// write the LANDED/LAND_FAILED status back.
export async function enqueueLandGitReview(reviewId: bigint): Promise<void> {
  await startBoss()
  await boss.send(GIT_LAND_REVIEW_QUEUE, { reviewId: String(reviewId) } satisfies LandGitReviewJobData)
}
