const BFF_GRAPHQL_URL = process.env.BFF_GRAPHQL_URL
const GIT_WORKER_TOKEN = process.env.GIT_WORKER_TOKEN

if (!BFF_GRAPHQL_URL) throw new Error('BFF_GRAPHQL_URL is not set')
if (!GIT_WORKER_TOKEN) throw new Error('GIT_WORKER_TOKEN is not set')

interface GraphQLResponse<T> {
  data?: T
  errors?: { message: string }[]
}

// Authenticates as a PAT bearer token — same mechanism the `ch` CLI and the
// hg worker already use on /graphql (see web/bff/src/index.ts's context
// function and auth/personal-access-token.ts) — against the reserved
// "codehub-git-worker" service account (see
// web/bff/scripts/seed-git-worker.mjs). Deliberately the only credential
// this container holds: no SSH key, no direct Postgres access.
export async function graphqlRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(BFF_GRAPHQL_URL as string, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${GIT_WORKER_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${await res.text()}`)
  }

  const json = (await res.json()) as GraphQLResponse<T>
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '))
  }
  if (!json.data) {
    throw new Error('GraphQL response missing data')
  }
  return json.data
}
