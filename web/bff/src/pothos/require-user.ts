import { GraphQLError } from 'graphql'
import type { ModelUser } from '@prisma/client'

// GraphQL Yoga masks plain `Error` throws as a generic "Unexpected error." for
// the client by default (by design — only unexpected/internal errors should
// be masked). Throwing a GraphQLError instead is what lets an expected,
// user-facing message like this one actually reach the client.
export function requireUser(user: ModelUser | null): ModelUser {
  if (!user) {
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  }
  return user
}
