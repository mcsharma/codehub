import { currentRepo, extractReviewNumber, log } from '../hg.ts'
import { getReview, landReview } from '../reviews.ts'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseReviewNumber(arg: string | undefined): number | null {
  if (!arg) return null
  const match = arg.match(/^D?(\d+)$/i)
  return match ? Number(match[1]) : null
}

export async function land(args: string[]): Promise<void> {
  const { owner, repo } = await currentRepo()

  let number = parseReviewNumber(args[0])
  if (number === null) {
    const [current] = await log('.')
    number = current ? extractReviewNumber(current.desc) : null
  }
  if (number === null) {
    console.error('No review number given, and the current commit has no Review-Id trailer.')
    console.error('Usage: ch land [D<number>]')
    Deno.exit(1)
  }

  console.log(`Landing D${number}...`)
  await landReview(owner, repo, number)

  // land_review only enqueues the job — poll for the async worker (see
  // web/bff/src/jobs/land-review.ts) to actually finish the graft.
  for (let i = 0; i < 60; i++) {
    await sleep(2000)
    const review = await getReview(owner, repo, number)
    if (!review) throw new Error(`D${number} disappeared while landing`)
    if (review.status === 'LANDED') {
      console.log(`D${number} landed as ${review.landed_node}`)
      return
    }
    if (review.status === 'LAND_FAILED') {
      console.error(`D${number} failed to land: ${review.land_error}`)
      Deno.exit(1)
    }
  }

  console.error(`D${number} is still landing after 2 minutes — check its status later.`)
  Deno.exit(1)
}
