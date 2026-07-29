import { currentRepo, extractReviewNumber, firstLine, hasEvolve, hg, hgNetwork, log, shortNode, withReviewTrailer } from '../hg.ts'
import { addReviewVersion, createReview, getReview } from '../reviews.ts'
import { loadConfig } from '../config.ts'

// Everything not-yet-landed below the working copy — root-first, so
// trailers get assigned bottom-to-top and each amend's cascade only ever
// touches commits we haven't processed yet.
const STACK_REVSET = 'sort(draft() and ancestors(.), rev)'

export async function submit(): Promise<void> {
  if (!(await hasEvolve())) {
    console.error(
      'The `evolve` extension is required — ch submit uses it to restack the rest of your\n' +
        'stack after tagging a commit with its Review-Id. Enable it in your hgrc:\n\n' +
        '  [extensions]\n  evolve =\n',
    )
    Deno.exit(1)
  }

  const { owner, repo } = await currentRepo()
  const { server } = await loadConfig()

  let stack = await log(STACK_REVSET)
  if (stack.length === 0) {
    console.log('Nothing to submit — no draft commits in the working copy stack.')
    return
  }

  // Pass 1: every commit gets a Review-Id trailer, creating a Review for
  // any that don't have one yet. Tagging a commit changes its hash, which
  // invalidates (obsoletes) every commit stacked above it, so this
  // deliberately re-reads the stack fresh on every iteration rather than
  // looping over a snapshotted array — `for (const entry of stack)` would
  // keep handing out stale, already-obsoleted node references once the
  // first metaedit+evolve cycle moves everything above it, and operating
  // on an obsolete node here silently produces a divergent changeset
  // instead of a clean restack.
  while (true) {
    const next = stack.find((entry) => extractReviewNumber(entry.desc) === null)
    if (!next) break
    const review = await createReview(owner, repo, firstLine(next.desc))
    await hg(['metaedit', '-r', next.node, '-m', withReviewTrailer(next.desc, review.number)])
    // `--all` alone only rebases orphans that belong *onto* the current
    // working copy parent — it does NOT fix the working copy's own parent
    // chain when metaedit just obsoleted an ancestor of `.` (confirmed:
    // bare `evolve`/`evolve --all` both refuse with "nothing to evolve on
    // current working copy parent" in exactly that case). `--any` is what
    // picks up "the checked-out commit itself is now an orphan," and
    // crucially updates `.` to follow — which the next loop iteration's
    // `ancestors(.)` re-read depends on.
    await hg(['evolve', '--any', '--all']).catch(() => {}) // no descendants to restack yet is not an error
    stack = await log(STACK_REVSET)
  }

  // Pass 2: push whatever actually changed. A commit whose node already
  // matches its review's latest known head is skipped — covers re-running
  // `ch submit` with nothing new to send, and the fixed point after pass 1
  // amended a commit that already had its final trailer.
  for (const entry of stack) {
    const number = extractReviewNumber(entry.desc)!
    const existing = await getReview(owner, repo, number)
    if (existing?.latest_version?.head_node === entry.node) {
      console.log(`D${number}: unchanged, skipping`)
      continue
    }

    // A bookmark scoped to this exact node, created and pushed fresh every
    // time — never reused or force-moved. That's what lets a plain push
    // create a new head without hitting hg's "creates new remote head"
    // guard, and it's also the only bookmark shape the server's
    // prepushkey hook accepts (see services/hg/hg_hooks.py).
    const bookmark = `reviews/${shortNode(entry.node)}`
    await hg(['bookmark', bookmark, '-r', entry.node])
    try {
      await hgNetwork(['push', '-B', bookmark])
    } finally {
      await hg(['bookmark', '--delete', bookmark]).catch(() => {})
    }

    await addReviewVersion(owner, repo, number, entry.node)
    console.log(`D${number}: ${server}/${owner}/${repo}/d/${number}`)
  }
}
