import 'dotenv/config'
import express from 'express'
import { createYoga } from 'graphql-yoga'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { builder } from '@bff/pothos/builder.js'
import '@bff/pothos/schema/index.js'
import { prisma } from '@bff/prisma/db.js'
import { writeFileSync } from 'node:fs'
import { printSchema, lexicographicSortSchema } from 'graphql'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 4000

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!

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

// 4. GitHub App OAuth routes

// Step 1: Redirect user to GitHub's authorization page.
app.get('/auth/github', (_req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: 'read:user user:email',
    redirect_uri: 'http://localhost:5173/auth/github/callback',
  })
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`)
})

// Step 2: GitHub redirects back here with a temporary code. Exchange it for a user access token.
app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code as string | undefined

  if (!code) {
    res.status(400).send('Missing code from GitHub callback.')
    return
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: 'http://localhost:5173/auth/github/callback',
      }),
    })

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string }

    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData)
      res.status(400).send('Failed to exchange GitHub token.')
      return
    }

    // Store the user access token in a secure HTTP-only cookie.
    res.cookie('github_token', tokenData.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days in ms
    })

    res.redirect('/')
  } catch (err) {
    console.error('GitHub callback error:', err)
    res.status(500).send('Internal server error during GitHub authentication.')
  }
})

// Step 3: Disconnect — clear the cookie and redirect home.
app.get('/auth/github/disconnect', (_req, res) => {
  res.clearCookie('github_token', { httpOnly: true, sameSite: 'lax' })
  res.redirect('/')
})

// 5. GraphQL Yoga Setup
type ExpressServerContext = { req: import('express').Request; res: import('express').Response }
const yoga = createYoga<ExpressServerContext>({
  schema: builder.toSchema(),
  graphqlEndpoint: '/graphql',
  context: (ctx) => ({ prisma, req: ctx.req }),
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

const GENERATED_HEADER =
  '# @generated - This file is generated, DO NOT modify it directly!\n\n'
const schemaAsString =
  GENERATED_HEADER + printSchema(lexicographicSortSchema(builder.toSchema()))
writeFileSync('./src/__generated__/schema.graphql', schemaAsString)

