import 'dotenv/config'
import express from 'express'
import { createYoga } from 'graphql-yoga'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { builder } from './pothos/builder.js'
import './pothos/schema/index.js'
import { prisma } from './prisma/db.js'
import { googleAuthRouter } from './auth/google.js'
import { SESSION_COOKIE, resolveSession } from './auth/session.js'
import { resolvePersonalAccessToken } from './auth/personal-access-token.js'
import { canAccessRepo } from './auth/repo-access.js'
import { writeFileSync } from 'node:fs'
import { printSchema, lexicographicSortSchema } from 'graphql'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 4000

// 1. Security Headers
// We disable CSP for development so the GraphiQL IDE can run inline scripts.
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production' ? undefined : false,
  }),
)

// 1b. Relaxed CSP for the GraphiQL IDE page only (production).
// Yoga's built-in GraphiQL HTML loads its JS/CSS bundle from unpkg.com and
// runs it via inline <script> tags with no nonce support, which the default
// CSP above blocks — that's why /graphql got stuck on "Loading __TITLE__...".
// Scoped to this route only so the rest of the app keeps the strict default.
if (process.env.NODE_ENV === 'production') {
  app.use(
    '/graphql',
    helmet.contentSecurityPolicy({
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
        'worker-src': ["'self'", 'blob:'],
        'connect-src': ["'self'", 'https://unpkg.com'],
        'img-src': ["'self'", 'data:', 'https://raw.githubusercontent.com'],
      },
    }),
  )
}

// 2. CORS Configuration
// This allows your Vite frontend (localhost:5173) to talk to this API.
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)

// 3. Cookie parser — must come before routes that read cookies.
app.use(cookieParser())

// 4. Internal auth-check — called by nginx `auth_request` in front of hgweb
// (see services/hg/README.md). nginx forwards the original request's path/method
// via X-Original-URI/X-Original-Method (it can't infer them from its own
// subrequest URI), and the original Authorization header comes through
// automatically since auth_request subrequests carry the original headers.
app.get('/internal/auth-check', async (req, res) => {
  const originalUri = req.header('x-original-uri') ?? ''
  // handle the request GET /alice/private-lib?cmd=capabilities HTTP/1.1
  const [path, query] = originalUri.split('?')
  const [, ownerName, repoName] = path.split('/')
  if (!ownerName || !repoName) {
    res.sendStatus(400)
    return
  }

  let user = null
  const authHeader = req.header('authorization')
  if (authHeader?.startsWith('Basic ')) {
    const decoded = Buffer.from(
      authHeader.slice('Basic '.length),
      'base64',
    ).toString('utf8')
    // Username is unchecked (same convention GitHub uses for PAT-over-Basic-Auth) —
    // everything after the first colon is treated as the token.
    const token = decoded.slice(decoded.indexOf(':') + 1)
    user = await resolvePersonalAccessToken(token)
  }

  // Classify by the wire-protocol `cmd`, not HTTP method: `unbundle` (push) is
  // always POST, but Mercurial's `httppostargs` feature also sends large *read*
  // commands like `getbundle` as POST once their arguments would overflow HTTP
  // header limits — so GET-vs-POST alone would wrongly deny big pulls/clones to
  // read-only users. `cmd` stays in the query string even when the rest of the
  // arguments move into the POST body.
  const cmd = new URLSearchParams(query ?? '').get('cmd')
  const action = cmd === 'unbundle' ? 'write' : 'read'
  const allowed = await canAccessRepo(user, ownerName, repoName, action)
  res.sendStatus(allowed ? 200 : 401)
})

// 4b. Login routes (Google OAuth today, more providers later).
app.use('/auth', googleAuthRouter)

// 5. GraphQL Yoga Setup
type ExpressServerContext = {
  req: import('express').Request
  res: import('express').Response
}
const yoga = createYoga<ExpressServerContext>({
  schema: builder.toSchema(),
  graphqlEndpoint: '/graphql',
  context: async (ctx) => {
    const rawToken = ctx.req.cookies?.[SESSION_COOKIE]
    const { user, session } = rawToken
      ? await resolveSession(rawToken)
      : { user: null, session: null }
    return { prisma, req: ctx.req, res: ctx.res, user, session }
  },
})

// 6. Bind Yoga to Express
// We use app.all so it handles GET (for the IDE) and POST (for Relay/queries)
// Cast needed because the generic TServerContext on yoga doesn't match Express's Application overload directly.
app.use(
  yoga.graphqlEndpoint,
  yoga as unknown as import('express').RequestHandler,
)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist')

// Serve static assets from frontend build directory
app.use(express.static(frontendDistPath))

// Wildcard route to serve the SPA index.html for client-side routing fallback
app.get('*any', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res
        .status(404)
        .send(
          'Frontend build not found. Run "pnpm run build" in frontend first.',
        )
    }
  })
})

app.listen(port, () => {
  console.log(`
 CodeHub BFF is running!
 API: http://localhost:${port}/graphql
  `)
})

if (process.env.NODE_ENV !== 'production') {
  const GENERATED_HEADER =
    '# @generated - This file is generated, DO NOT modify it directly!\n\n'
  const schemaAsString =
    GENERATED_HEADER + printSchema(lexicographicSortSchema(builder.toSchema()))
  writeFileSync('./src/__generated__/schema.graphql', schemaAsString)
}
