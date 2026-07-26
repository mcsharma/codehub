const HG_WEB_BASE = process.env.HG_WEB_BASE ?? 'https://hg.greensnippet.com'

export interface HgChangeset {
  node: string
  date: [number, number]
  desc: string
  branch: string
  bookmarks: string[]
  tags: string[]
  user: string
  phase: string
  parents: string[]
  files?: { file: string; status: string }[]
}

export interface HgBookmark {
  bookmark: string
  node: string
  date: [number, number]
}

function hgwebAuthHeaders(): HeadersInit {
  const token = process.env.HG_INTERNAL_TOKEN
  if (!token) {
    throw new Error('HG_INTERNAL_TOKEN is not configured')
  }
  return { Authorization: 'Basic ' + Buffer.from(`internal:${token}`).toString('base64') }
}

async function hgwebFetch<T>(owner: string, repo: string, pathAndQuery: string): Promise<T> {
  const url = `${HG_WEB_BASE}/${owner}/${repo}/${pathAndQuery}`
  const res = await fetch(url, { headers: hgwebAuthHeaders() })
  if (!res.ok) {
    throw new Error(`hgweb request failed (${res.status}): ${pathAndQuery}`)
  }
  return res.json() as Promise<T>
}

// Raw (non-JSON) counterpart of hgwebFetch — used where the response isn't
// JSON, or where the caller needs the actual bytes (e.g. to sniff for
// binary content) rather than a decoded string.
async function hgwebFetchRaw(owner: string, repo: string, pathAndQuery: string): Promise<Buffer> {
  const url = `${HG_WEB_BASE}/${owner}/${repo}/${pathAndQuery}`
  const res = await fetch(url, { headers: hgwebAuthHeaders() })
  if (!res.ok) {
    throw new Error(`hgweb request failed (${res.status}): ${pathAndQuery}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

export async function fetchBookmarks(owner: string, repo: string): Promise<HgBookmark[]> {
  const data = await hgwebFetch<{ bookmarks: HgBookmark[] }>(owner, repo, 'bookmarks?style=json')
  return data.bookmarks
}

// hgweb's `/shortlog/<node>?style=json&revcount=N` returns N changesets
// starting AT AND INCLUDING <node>, walking backward toward the root — it's
// not an "after" cursor, it's a "starting point" (confirmed against a local
// throwaway repo, since this isn't documented anywhere obvious). So a
// continuation page's first entry always duplicates the previous page's
// cursor and has to be dropped.
//
// Returns up to `count` changesets — the caller (a Pothos
// `resolveCursorConnection`) is the one that overfetches by one and trims,
// so this just needs to return as many as it can find, capped at `count`.
export async function fetchShortlog(
  owner: string,
  repo: string,
  opts: { after?: string; count: number },
): Promise<HgChangeset[]> {
  const { after, count } = opts

  if (!after) {
    const data = await hgwebFetch<{ changesets: HgChangeset[] }>(
      owner,
      repo,
      `shortlog?style=json&revcount=${count}`,
    )
    return (data.changesets ?? []).slice(0, count)
  }

  const data = await hgwebFetch<{ changesets: HgChangeset[] }>(
    owner,
    repo,
    `shortlog/${after}?style=json&revcount=${count + 1}`,
  )
  return (data.changesets ?? []).slice(1, count + 1) // drop the duplicated cursor entry
}

// `/rev/<node>?style=json` is the single-changeset counterpart of
// `/shortlog` — same per-changeset shape, plus `files`.
export async function fetchChangeset(owner: string, repo: string, node: string): Promise<HgChangeset> {
  return hgwebFetch<HgChangeset>(owner, repo, `rev/${node}?style=json`)
}

// `/raw-rev/<node>` returns the real Mercurial patch: an "# HG changeset
// patch" header (metadata we already have from fetchChangeset) followed by
// one or more standard unified-diff sections (one per changed file,
// starting with `diff -r <parent> -r <node> <path>`). We only want the diff
// portion — everything from the first such line onward — so callers get a
// clean multi-file unified diff.
export async function fetchRawDiff(owner: string, repo: string, node: string): Promise<string> {
  const patch = (await hgwebFetchRaw(owner, repo, `raw-rev/${node}`)).toString('utf-8')
  const diffStart = patch.search(/^diff -r /m)
  return diffStart === -1 ? '' : patch.slice(diffStart)
}

export interface HgDirectoryListing {
  directories: { abspath: string; basename: string }[]
  files: { abspath: string; basename: string; size: number; date: [number, number] }[]
}

// `/file/<rev>[/<path>]?style=json` lists a directory's immediate children
// at a revision — no path segment means the repo root. There's no "whole
// tree" endpoint, so browsing is inherently one directory at a time.
export async function fetchDirectory(
  owner: string,
  repo: string,
  rev: string,
  path: string,
): Promise<HgDirectoryListing> {
  const suffix = path ? `${rev}/${path}` : rev
  return hgwebFetch<HgDirectoryListing>(owner, repo, `file/${suffix}?style=json`)
}

// `/raw-file/<rev>/<path>` returns the file's raw bytes. hgweb always
// responds with `Content-Type: application/binary` regardless of the
// file's real type, so there's no server-side signal to tell text from
// binary — callers have to sniff the bytes themselves.
export async function fetchRawFile(owner: string, repo: string, rev: string, path: string): Promise<Buffer> {
  return hgwebFetchRaw(owner, repo, `raw-file/${rev}/${path}`)
}

export interface HgLogEntry {
  node: string
  date: [number, number]
  desc: string
}

// `/log/<rev>/<path>?style=json` returns the changesets that touched
// that exact file path, tip-first — the first entry is the file's last
// commit. This only works for files: hgweb's `/log` webcommand does a
// manifest lookup, and directories aren't manifest entries, so this
// 404s (real HTTP status, not a 200 with an `{error}` body) for both
// directory paths and nonexistent files — either way we just have no
// last-commit info to show.
export async function fetchFileLog(owner: string, repo: string, rev: string, path: string): Promise<HgLogEntry | null> {
  try {
    const data = await hgwebFetch<{ entries: HgLogEntry[] }>(owner, repo, `log/${rev}/${path}?style=json`)
    return data.entries[0] ?? null
  } catch {
    return null
  }
}
