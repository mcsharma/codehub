import { currentRepo, log, pruneAndRestack, pull } from '../git.ts'
import { extractReviewNumber } from '../trailer.ts'
import { getReview } from '../reviews.ts'

const STACK_REVSET = 'sort(not public() & ancestors(.), rev)'

export async function syncGit(): Promise<void> {
  const { owner, repo } = await currentRepo()
  await pull()

  const stack = await log(STACK_REVSET)
  const submitted = stack.filter((entry) => extractReviewNumber(entry.desc) !== null)
  if (submitted.length === 0) {
    console.log('Nothing to sync — no submitted commits in the working copy stack.')
    return
  }

  for (const entry of submitted) {
    const number = extractReviewNumber(entry.desc)!
    const review = await getReview(owner, repo, number)
    if (review?.status === 'LANDED' && review.landed_node) {
      await pruneAndRestack(entry.node, review.landed_node)
      console.log(`D${number}: landed, pruned local copy`)
    }
  }
}
