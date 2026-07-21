import { builder } from '../builder.js'

// --- Shared helper: make authenticated GitHub API calls ---

async function githubFetch(token: string, path: string): Promise<unknown> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!response.ok) {
    return null
  }
  return response.json()
}

// --- Plain object types (not Prisma-backed) ---

const GitHubUserRef = builder.objectRef<Record<string, unknown>>('GitHubUser')
const GitHubRepositoryRef = builder.objectRef<Record<string, unknown>>('GitHubRepository')
const GitHubCommitRef = builder.objectRef<Record<string, unknown>>('GitHubCommit')

GitHubUserRef.implement({
  description: 'A GitHub user profile returned from the GitHub API.',
  fields: (t) => ({
    login: t.string({ resolve: (obj) => obj.login as string }),
    name: t.string({ nullable: true, resolve: (obj) => (obj.name as string | null) ?? null }),
    avatar_url: t.string({ resolve: (obj) => obj.avatar_url as string }),
    html_url: t.string({ resolve: (obj) => obj.html_url as string }),
  }),
})

GitHubRepositoryRef.implement({
  description: 'A GitHub repository returned from the GitHub API.',
  fields: (t) => ({
    id: t.string({ resolve: (obj) => String(obj.id) }),
    name: t.string({ resolve: (obj) => obj.name as string }),
    full_name: t.string({ nullable: true, resolve: (obj) => (obj.full_name as string | null) ?? null }),
    private: t.boolean({ resolve: (obj) => obj.private as boolean }),
    html_url: t.string({ nullable: true, resolve: (obj) => (obj.html_url as string | null) ?? null }),
    description: t.string({ nullable: true, resolve: (obj) => (obj.description as string | null) ?? null }),
    default_branch: t.string({ resolve: (obj) => obj.default_branch as string }),
  }),
})

GitHubCommitRef.implement({
  description: 'A commit returned from the GitHub API.',
  fields: (t) => ({
    sha: t.string({ nullable: true, resolve: (obj) => (obj.sha as string | null) ?? null }),
    message: t.string({
      nullable: true,
      resolve: (obj) => {
        const c = obj as { commit: { message: string } }
        return c.commit?.message ?? null
      },
    }),
    author_name: t.string({
      nullable: true,
      resolve: (obj) => {
        const c = obj as { commit: { author?: { name?: string } } }
        return c.commit?.author?.name ?? null
      },
    }),
    author_date: t.string({
      nullable: true,
      resolve: (obj) => {
        const c = obj as { commit: { author?: { date?: string } } }
        return c.commit?.author?.date ?? null
      },
    }),
    html_url: t.string({ nullable: true, resolve: (obj) => (obj.html_url as string | null) ?? null }),
  }),
})

// --- Queries ---

// Returns the authenticated GitHub user, or null if not connected / token invalid.
builder.queryField('github_viewer', (t) =>
  t.field({
    type: GitHubUserRef,
    nullable: true,
    description: 'Returns the currently connected GitHub user, or null if not connected.',
    resolve: async (_root, _args, ctx) => {
      const token = (ctx.req as { cookies?: Record<string, string> }).cookies?.github_token
      if (!token) {
        return null
      }
      const user = await githubFetch(token, '/user')
      return (user as Record<string, unknown>) ?? null
    },
  }),
)

// Returns all repositories the authenticated user has access to.
builder.queryField('github_repositories', (t) =>
  t.field({
    type: [GitHubRepositoryRef],
    nullable: false,
    description: 'Returns repositories the connected GitHub user has access to.',
    resolve: async (_root, _args, ctx) => {
      const token = (ctx.req as { cookies?: Record<string, string> }).cookies?.github_token
      if (!token) {
        return []
      }
      const repos = await githubFetch(
        token,
        '/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator,organization_member',
      )
      if (!Array.isArray(repos)) {
        return []
      }
      return repos as Record<string, unknown>[]
    },
  }),
)

// Returns commits for a specific GitHub repository.
builder.queryField('github_commits', (t) =>
  t.field({
    type: [GitHubCommitRef],
    nullable: false,
    description: 'Returns commits for a GitHub repository.',
    args: {
      owner: t.arg.string({ required: true }),
      repo: t.arg.string({ required: true }),
      branch: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const token = (ctx.req as { cookies?: Record<string, string> }).cookies?.github_token
      if (!token) {
        return []
      }
      const params = new URLSearchParams({ per_page: '30' })
      if (args.branch) {
        params.set('sha', args.branch)
      }
      const commits = await githubFetch(
        token,
        `/repos/${args.owner}/${args.repo}/commits?${params.toString()}`,
      )
      if (!Array.isArray(commits)) {
        return []
      }
      return commits as Record<string, unknown>[]
    },
  }),
)
