import type { Job } from 'pg-boss'
import { boss, startBoss } from './boss.js'
import { prisma } from '../prisma/db.js'
import { resolveOwnerName } from '../pothos/schema/repository.js'
import { landReviewOnVm } from '../repos/land-on-vm.js'
import { landReviewLocally } from '../repos/land-local.js'

const QUEUE = 'land-review'

interface LandReviewJobData {
  // BigInt isn't JSON-serializable, so the review id crosses the job queue
  // as a string.
  reviewId: string
}

export async function enqueueLandReview(reviewId: bigint): Promise<void> {
  await startBoss()
  await boss.send(QUEUE, { reviewId: String(reviewId) } satisfies LandReviewJobData)
}

// Called once from index.ts after startBoss(). Concurrency is pg-boss's
// default (1 worker loop for this queue) — deliberately not parallelized:
// a given hg repo only ever has one writer at a time anyway (hg's own repo
// lock serializes it), so nothing is gained by racing landings against each
// other, and it keeps this first bit of job infra simple.
export async function registerLandReviewWorker(): Promise<void> {
  await boss.createQueue(QUEUE)
  await boss.work(QUEUE, async ([job]: Job<LandReviewJobData>[]) => {
    const reviewId = BigInt(job.data.reviewId)
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) {
      console.error(`land-review job: review ${reviewId} no longer exists, skipping`)
      return
    }

    const repo = await prisma.repository.findUniqueOrThrow({ where: { id: review.repositoryId } })
    const ownerName = await resolveOwnerName(repo, prisma)

    const version = await prisma.reviewVersion.findFirst({
      where: { reviewId: review.id },
      orderBy: { version: 'desc' },
    })
    if (!version) {
      await prisma.review.update({
        where: { id: review.id },
        data: { status: 'LAND_FAILED', landError: 'No submitted version to land' },
      })
      return
    }

    try {
      const landedNode = process.env.HG_LOCAL_REPOS_DIR
        ? await landReviewLocally(ownerName, repo.name, version.headNode)
        : await landReviewOnVm(ownerName, repo.name, version.headNode)
      await prisma.review.update({
        where: { id: review.id },
        data: { status: 'LANDED', landedNode, landError: null },
      })
    } catch (err) {
      console.error(`Landing D${review.number} (${ownerName}/${repo.name}) failed:`, err)
      await prisma.review.update({
        where: { id: review.id },
        data: { status: 'LAND_FAILED', landError: err instanceof Error ? err.message : String(err) },
      })
    }
  })
}
