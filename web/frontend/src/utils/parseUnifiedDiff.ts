// hgweb's raw diff (after fetchRawDiff strips the patch header) is a
// standard multi-file unified diff: one `diff -r <rev> -r <rev> <path>`
// section per file, each with `---`/`+++` file headers followed by one or
// more `@@ ... @@` hunks.
//
// @git-diff-view/react's `data.hunks` entries are each parsed independently
// by the library (via DiffFile -> DiffParser.parse), and that parser scans
// for a `---`/`+++` header pair *before* it starts collecting `@@` hunks —
// confirmed directly against @git-diff-view/core: a bare `@@ ...` string
// with no header produces zero rendered lines (silently — no error, no
// visible diff), while the same content with its `---`/`+++` header intact
// parses correctly. So each map entry here is the *whole* per-file section
// (header + all its hunks), not hunks split out on their own.
export function parseUnifiedDiff(diffText: string): Map<string, string> {
  const result = new Map<string, string>();
  if (!diffText) return result;

  const fileChunks = diffText.split(/^(?=diff -r )/m).filter(Boolean);

  for (const chunk of fileChunks) {
    const firstLine = chunk.slice(0, chunk.indexOf("\n"));
    // `diff -r <rev1> -r <rev2> <path>` — path is everything after the
    // second rev hash.
    const match = firstLine.match(/^diff -r \S+ -r \S+ (.+)$/);
    if (!match) continue;
    const path = match[1];

    if (/^@@ /m.test(chunk)) {
      result.set(path, chunk);
    }
  }

  return result;
}

export function countDiffStats(chunk: string): { additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;
  for (const line of chunk.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) continue;
    if (line.startsWith("+")) additions++;
    else if (line.startsWith("-")) deletions++;
  }
  return { additions, deletions };
}
