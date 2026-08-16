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
import { writeFileSync } from 'node:fs'
import { printSchema, lexicographicSortSchema } from 'graphql'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Fail fast with a clear, actionable message if Postgres isn't reachable —
// much more useful than the raw ECONNREFUSED that'd otherwise surface deep
// inside the first GraphQL request a client happens to make.
try {
  await prisma.$queryRaw`SELECT 1`
} catch {
  const maskedUrl = (process.env.DATABASE_URL ?? '(not set)').replace(/:[^:@/]*@/, ':****@')
  console.error(`
Could not connect to the database (DATABASE_URL: ${maskedUrl}).

If local Postgres isn't running yet, start it from the repo root:

  docker compose up -d

Then restart this server.
`)
  process.exit(1)
}

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

// 4. Login routes (Google OAuth today, more providers later).
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
    // Bearer token (a PersonalAccessToken) for API clients — the web UI
    // keeps using the session cookie below.
    const authHeader = ctx.req.header('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const user = await resolvePersonalAccessToken(authHeader.slice('Bearer '.length))
      return { prisma, req: ctx.req, res: ctx.res, user, session: null }
    }

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
 BFF is running!
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
