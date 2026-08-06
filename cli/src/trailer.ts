// Pure string/regex helpers for the "Review-Id: D<number>" commit-message
// trailer — no VCS dependency, shared by hg.ts and git.ts.

export function firstLine(desc: string): string {
  return desc.split('\n')[0].trim()
}

const REVIEW_ID_RE = /^Review-Id: D(\d+)$/m

export function extractReviewNumber(desc: string): number | null {
  const match = desc.match(REVIEW_ID_RE)
  return match ? Number(match[1]) : null
}

export function withReviewTrailer(desc: string, number: number): string {
  return `${desc}\n\nReview-Id: D${number}`
}
