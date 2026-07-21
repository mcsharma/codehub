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
// (see services/hg/README.md). Always allows for now; real per-tenant
// permission checks are a deliberate follow-up.
app.get('/internal/auth-check', (_req, res) => {
  res.sendStatus(200)
})

// 4b. Login routes (Google OAuth today, more providers later).
app.use('/auth', googleAuthRouter)

// 5. GraphQL Yoga Setup
type ExpressServerContext = { req: import('express').Request; res: import('express').Response }
const yoga = createYoga<ExpressServerContext>({
  schema: builder.toSchema(),
  graphqlEndpoint: '/graphql',
  context: async (ctx) => {
    const rawToken = ctx.req.cookies?.[SESSION_COOKIE]
    const { user, session } = rawToken ? await resolveSession(rawToken) : { user: null, session: null }
    return { prisma, req: ctx.req, res: ctx.res, user, session }
  },
})

// 6. Bind Yoga to Express
// We use app.all so it handles GET (for the IDE) and POST (for Relay/queries)
// Cast needed because the generic TServerContext on yoga doesn't match Express's Application overload directly.
app.use(yoga.graphqlEndpoint, yoga as unknown as import('express').RequestHandler)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist')

// Serve static assets from frontend build directory
app.use(express.static(frontendDistPath))

// Wildcard route to serve the SPA index.html for client-side routing fallback
app.get('*any', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend build not found. Run "pnpm run build" in frontend first.')
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

