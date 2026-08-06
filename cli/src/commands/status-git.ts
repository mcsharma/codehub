import { currentRepo, log } from '../git.ts'
import { extractReviewNumber, firstLine } from '../trailer.ts'
import { getReview } from '../reviews.ts'

const STACK_REVSET = 'sort(not public() & ancestors(.), rev)'

export async function statusGit(): Promise<void> {
  const { owner, repo } = await currentRepo()
  const stack = await log(STACK_REVSET)
  if (stack.length === 0) {
    console.log('No unlanded commits in the working copy stack.')
    return
  }

  for (const entry of stack) {
    const number = extractReviewNumber(entry.desc)
    if (number === null) {
      console.log(`${entry.node.slice(0, 12)}  (not submitted)  ${firstLine(entry.desc)}`)
      continue
    }
    const review = await getReview(owner, repo, number)
    const label = review ? `D${number} ${review.status}` : `D${number} (unknown)`
    console.log(`${entry.node.slice(0, 12)}  ${label.padEnd(20)}  ${firstLine(entry.desc)}`)
  }
}
