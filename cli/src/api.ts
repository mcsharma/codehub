import { loadConfig } from './config.ts'

export class ApiError extends Error {}

interface GraphQLResponse<T> {
  data?: T
  errors?: { message: string }[]
}

export async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const { server, token } = await loadConfig()
  const res = await fetch(`${server}/graphql`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    throw new ApiError(`${server}/graphql responded ${res.status}: ${(await res.text()).slice(0, 500)}`)
  }
  const json = (await res.json()) as GraphQLResponse<T>
  if (json.errors?.length) {
    throw new ApiError(json.errors.map((e) => e.message).join('; '))
  }
  if (json.data === undefined) {
    throw new ApiError('Server response had neither data nor errors')
  }
  return json.data
}
