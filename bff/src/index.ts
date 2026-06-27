import express from 'express'
import { createYoga } from 'graphql-yoga'
import cors from 'cors'
import helmet from 'helmet'
import { builder } from '@bff/pothos/builder.js'
import '@bff/pothos/schema/index.js'
import { prisma } from '@bff/prisma/db.js'
import { writeFileSync } from 'node:fs'
import { printSchema, lexicographicSortSchema } from 'graphql'

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

// 3. GraphQL Yoga Setup
const yoga = createYoga({
  schema: builder.toSchema(),
  graphqlEndpoint: '/graphql',
  context: () => ({ prisma }),
})

// 4. Bind Yoga to Express
// We use app.all so it handles GET (for the IDE) and POST (for Relay/queries)
app.use(yoga.graphqlEndpoint, yoga)

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
