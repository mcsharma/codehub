import { createServer, type ServerResponse } from 'node:http'
import { HttpError, changeset, directory, fileLog, rawDiff, rawFile, shortlog } from './git-log.js'

const PORT = Number(process.env.PORT ?? 9100)

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

// No auth here — reached only via git-proxy's nginx, which already gates
// every request through `auth_request /internal/auth-check` before
// proxying (see services/git/vm/nginx-{prod,test}.conf and this plan's
// "Auth" section). Not published on any port itself (see docker-compose).
const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' || !req.url) {
      res.writeHead(405)
      res.end()
      return
    }
    const url = new URL(req.url, 'http://internal')
    const segments = url.pathname.split('/').filter(Boolean)
    // /<owner>/<repo>/_browse/<verb>[/<rest...>]
    const [owner, repo, browseSegment, verb, ...rest] = segments
    if (browseSegment !== '_browse' || !owner || !repo || !verb) {
      res.writeHead(404)
      res.end()
      return
    }

    switch (verb) {
      case 'shortlog': {
        const count = Number(url.searchParams.get('count') ?? '20')
        const after = url.searchParams.get('after') ?? undefined
        sendJson(res, 200, { changesets: await shortlog(owner, repo, count, after) })
        return
      }
      case 'rev': {
        const [sha] = rest
        if (!sha) throw new HttpError(400, 'missing sha')
        sendJson(res, 200, await changeset(owner, repo, sha))
        return
      }
      case 'raw-rev': {
        const [sha] = rest
        if (!sha) throw new HttpError(400, 'missing sha')
        const diff = await rawDiff(owner, repo, sha)
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end(diff)
        return
      }
      case 'file': {
        const [rev, ...pathParts] = rest
        if (!rev) throw new HttpError(400, 'missing rev')
        sendJson(res, 200, await directory(owner, repo, rev, pathParts.join('/')))
        return
      }
      case 'raw-file': {
        const [rev, ...pathParts] = rest
        if (!rev || pathParts.length === 0) throw new HttpError(400, 'missing rev/path')
        const buf = await rawFile(owner, repo, rev, pathParts.join('/'))
        res.writeHead(200, { 'Content-Type': 'application/octet-stream' })
        res.end(buf)
        return
      }
      case 'log': {
        const [rev, ...pathParts] = rest
        if (!rev || pathParts.length === 0) throw new HttpError(400, 'missing rev/path')
        const entry = await fileLog(owner, repo, rev, pathParts.join('/'))
        sendJson(res, 200, { entries: entry ? [entry] : [] })
        return
      }
      default:
        res.writeHead(404)
        res.end()
    }
  } catch (err) {
    if (err instanceof HttpError) {
      sendJson(res, err.status, { error: err.message })
      return
    }
    console.error('git-browse request failed:', err)
    sendJson(res, 500, { error: 'internal error' })
  }
})

server.listen(PORT, () => {
  console.log(`git-browse listening on :${PORT}`)
})
