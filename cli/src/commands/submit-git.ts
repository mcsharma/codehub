import { amend, currentRepo, log, pushToReviewRef } from '../git.ts'
import { extractReviewNumber, withReviewTrailer } from '../trailer.ts'
import { getReview } from '../reviews.ts'
import { loadConfig } from '../config.ts'

// Everything not-yet-landed below the working copy — the git/Sapling analog
// of submit-hg.ts's STACK_REVSET. Sapling's revset language is
// hg-compatible but phase terminology differs (`public()` vs. hg's
// `draft()`) — verify this exact syntax against a real `sl` install.
const STACK_REVSET = 'sort(not public() & ancestors(.), rev)'

// Matches the "D<n>: <url>" line services/git/hooks/post-receive echoes
// back on a review-creating push — search the whole combined stdout+stderr
// rather than anchoring to a line start, since git may prefix hook output
// with its own "remote: " on top of the hook's own.
const REVIEW_LINK_RE = /D(\d+):/

export async function submitGit(): Promise<void> {
  const { owner, repo } = await currentRepo()
  const { server } = await loadConfig()

  let stack = await log(STACK_REVSET)
  if (stack.length === 0) {
    console.log('Nothing to submit — no unlanded commits in the working copy stack.')
    return
  }

  // Pass 1: every commit gets a Review-Id trailer. Unlike hg (create the
  // review via GraphQL, then stamp the trailer), a git review's number only
  // exists after the first push — the post-receive hook creates it (see
  // services/git/hooks/post-receive) — so this pushes un-numbered commits
  // first and stamps the trailer from the hook's reply. Re-reads the stack
  // fresh each iteration for the same reason submit-hg.ts does: amending a
  // commit changes its hash and Sapling restacks descendants onto the new
  // one, so a snapshotted array would hand back stale, already-obsoleted
  // node references.
  while (true) {
    const next = stack.find((entry) => extractReviewNumber(entry.desc) === null)
    if (!next) break
    const output = await pushToReviewRef(next.node)
    const match = output.match(REVIEW_LINK_RE)
    if (!match) {
      throw new Error(
        `Pushed ${next.node} but couldn't find a review number in the server's response:\n${output}`,
      )
    }
    await amend(next.node, withReviewTrailer(next.desc, Number(match[1])))
    stack = await log(STACK_REVSET)
  }

  // Pass 2: push whatever actually changed. Pass 1's push already recorded
  // a version at the pre-trailer node; amend()ing it afterward changed the
  // hash, so every freshly-numbered commit lands here too and gets its
  // real (trailered) version pushed — same fixed-point behavior as
  // submit-hg.ts's pass 2, and the same skip-if-unchanged check.
  for (const entry of stack) {
    const number = extractReviewNumber(entry.desc)!
    const existing = await getReview(owner, repo, number)
    if (existing?.latest_version?.head_node === entry.node) {
      console.log(`D${number}: unchanged, skipping`)
      continue
    }
    await pushToReviewRef(entry.node)
    console.log(`D${number}: ${server}/${owner}/${repo}/d/${number}`)
  }
}
