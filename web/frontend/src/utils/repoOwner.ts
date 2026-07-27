interface RepoOwnerLike {
  __typename?: string
  username?: string | null
  name?: string | null
}

// Repository owners are a User|Organization union — every repo-scoped page
// resolves the same way, but the field that holds the display name differs
// per type (`username` vs `name`).
export const resolveOwnerName = (
  owner: RepoOwnerLike | null | undefined,
  fallback: string,
): string =>
  (owner?.__typename === 'User'
    ? owner.username
    : owner?.__typename === 'Organization'
      ? owner.name
      : null) ?? fallback
