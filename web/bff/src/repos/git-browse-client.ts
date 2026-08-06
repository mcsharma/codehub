// Structural mirror of hgweb-client.ts, talking to the new git-browse
// service (services/git/browse/) instead of hgweb — see
// docs/plans/zesty-zooming-cupcake.md. Reuses hgweb-client.ts's
// HgChangeset/HgDirectoryListing/HgLogEntry types since they're already
// VCS-neutral shapes (nothing hg-specific about the field names), so
// repository.ts/review.ts's resolvers can branch on `vcsKind` without
// needing separate shape-handling code.
import type { HgChangeset, HgDirectoryListing, HgLogEntry } from './hgweb-client.js'

const GIT_BROWSE_BASE = process.env.GIT_BROWSE_BASE
if (!GIT_BROWSE_BASE) {
  throw new Error('GIT_BROWSE_BASE is not configured')
}

function gitBrowseAuthHeaders(): HeadersInit {
  const token = process.env.GIT_INTERNAL_TOKEN
  if (!token) {
    throw new Error('GIT_INTERNAL_TOKEN is not configured')
  }
  return { Authorization: 'Basic ' + Buffer.from(`internal:${token}`).toString('base64') }
}

async function gitBrowseFetch<T>(owner: string, repo: string, pathAndQuery: string): Promise<T> {
  const url = `${GIT_BROWSE_BASE}/${owner}/${repo}/_browse/${pathAndQuery}`
  const res = await fetch(url, { headers: gitBrowseAuthHeaders() })
  if (!res.ok) {
    throw new Error(`git-browse request failed (${res.status}): ${pathAndQuery}`)
  }
  return res.json() as Promise<T>
}

async function gitBrowseFetchRaw(owner: string, repo: string, pathAndQuery: string): Promise<Buffer> {
  const url = `${GIT_BROWSE_BASE}/${owner}/${repo}/_browse/${pathAndQuery}`
  const res = await fetch(url, { headers: gitBrowseAuthHeaders() })
  if (!res.ok) {
    throw new Error(`git-browse request failed (${res.status}): ${pathAndQuery}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

// No bookmarks equivalent — see the plan's Non-goals; RepositoryObject.
// bookmarks stays hg-only.

export async function fetchShortlog(
  owner: string,
  repo: string,
  opts: { after?: string; count: number },
): Promise<HgChangeset[]> {
  const { after, count } = opts
  const query = after ? `count=${count}&after=${after}` : `count=${count}`
  const data = await gitBrowseFetch<{ changesets: HgChangeset[] }>(owner, repo, `shortlog?${query}`)
  return data.changesets ?? []
}

export async function fetchChangeset(owner: string, repo: string, node: string): Promise<HgChangeset> {
  return gitBrowseFetch<HgChangeset>(owner, repo, `rev/${node}`)
}

export async function fetchRawDiff(owner: string, repo: string, node: string): Promise<string> {
  return (await gitBrowseFetchRaw(owner, repo, `raw-rev/${node}`)).toString('utf-8')
}

export async function fetchDirectory(
  owner: string,
  repo: string,
  rev: string,
  path: string,
): Promise<HgDirectoryListing> {
  const suffix = path ? `${rev}/${path}` : rev
  return gitBrowseFetch<HgDirectoryListing>(owner, repo, `file/${suffix}`)
}

export async function fetchRawFile(owner: string, repo: string, rev: string, path: string): Promise<Buffer> {
  return gitBrowseFetchRaw(owner, repo, `raw-file/${rev}/${path}`)
}

export async function fetchFileLog(owner: string, repo: string, rev: string, path: string): Promise<HgLogEntry | null> {
  try {
    const data = await gitBrowseFetch<{ entries: HgLogEntry[] }>(owner, repo, `log/${rev}/${path}`)
    return data.entries[0] ?? null
  } catch {
    return null
  }
}
