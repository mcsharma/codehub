// hgweb's raw diff (after fetchRawDiff strips the patch header) is a
// standard multi-file unified diff: one `diff -r <rev> -r <rev> <path>`
// section per file, each with `---`/`+++` file headers followed by one or
// more `@@ ... @@` hunks. @git-diff-view/react's `data.hunks` prop wants
// just the hunk blocks (the `@@` line plus its content lines) per file, not
// the surrounding file headers — so this splits the raw text into
// path -> hunks[].
export function parseUnifiedDiff(diffText: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  if (!diffText) return result;

  const fileChunks = diffText.split(/^(?=diff -r )/m).filter(Boolean);

  for (const chunk of fileChunks) {
    const firstLine = chunk.slice(0, chunk.indexOf("\n"));
    // `diff -r <rev1> -r <rev2> <path>` — path is everything after the
    // second rev hash.
    const match = firstLine.match(/^diff -r \S+ -r \S+ (.+)$/);
    if (!match) continue;
    const path = match[1];

    const hunks = chunk.split(/^(?=@@ )/m).filter((line) => line.startsWith("@@ "));
    if (hunks.length > 0) {
      result.set(path, hunks);
    }
  }

  return result;
}

export function countDiffStats(hunks: string[]): { additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;
  for (const hunk of hunks) {
    for (const line of hunk.split("\n")) {
      if (line.startsWith("+")) additions++;
      else if (line.startsWith("-")) deletions++;
    }
  }
  return { additions, deletions };
}
