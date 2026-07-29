import { currentRepo, extractReviewNumber, hasEvolve, hg, hgNetwork, log } from '../hg.ts'
import { getReview } from '../reviews.ts'

const STACK_REVSET = 'sort(draft() and ancestors(.), rev)'

export async function sync(): Promise<void> {
  if (!(await hasEvolve())) {
    console.error('The `evolve` extension is required — ch sync uses it to restack your stack after a pull.')
    Deno.exit(1)
  }

  const { owner, repo } = await currentRepo()
  await hgNetwork(['pull'])

  const stack = await log(STACK_REVSET)
  const submitted = stack.filter((entry) => extractReviewNumber(entry.desc) !== null)
  if (submitted.length === 0) {
    console.log('Nothing to sync — no submitted commits in the working copy stack.')
    return
  }

  let prunedAny = false
  for (const entry of submitted) {
    const number = extractReviewNumber(entry.desc)!
    const review = await getReview(owner, repo, number)
    if (review?.status === 'LANDED' && review.landed_node) {
      // Records a local obsmarker pointing the old (pre-land) node at its
      // public successor — never touches the server, which already has
      // both under land-review.sh's own graft (see services/hg/README.md).
      await hg(['prune', '-r', entry.node, '-s', review.landed_node])
      prunedAny = true
      console.log(`D${number}: landed, pruned local copy`)
    }
  }

  if (prunedAny) {
    // --any is required, not just --all — see the comment in submit.ts.
    // Pruning the landed commits orphans whatever's left of the stack
    // above them, and if `.` is among that remainder, `--any` is what
    // fixes the working copy's own parent chain and moves `.` along.
    await hg(['evolve', '--any', '--all']).catch(() => {})
  }
}
