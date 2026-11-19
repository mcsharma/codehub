import { GraphQLError } from 'graphql'
import type { ModelUser } from '@prisma/client'
import { builder } from '../builder.js'
import { boss } from '../../jobs/boss.js'
import { GIT_JOB_QUEUES } from '../../jobs/queues.js'

// Git-kind counterpart to hg-worker.ts. The VM worker (services/git/worker/)
// is the sole consumer of the git job queues — it polls claim_git_job,
// executes the op against its stack's own bare-repo volume (no SSH, no
// direct Postgres access, same reasoning as the hg worker), and reports back
// via complete_git_job/fail_git_job. Authenticated as a dedicated
// per-environment service-account PAT, same bearer-token mechanism the hg
// worker uses.
const GIT_WORKER_USERNAME = 'codehub-git-worker'

function requireGitWorker(user: ModelUser | null): ModelUser {
  if (!user || user.username !== GIT_WORKER_USERNAME) {
    throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } })
  }
  return user
}

interface ProvisionOrDeleteJobData {
  owner: string
  repo: string
}

interface GitJobShape {
  id: string
  queue: string
  owner: string
  repo: string
}

const GitJobObject = builder.objectRef<GitJobShape>('GitJob').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    queue: t.exposeString('queue'),
    owner: t.exposeString('owner'),
    repo: t.exposeString('repo'),
  }),
})

builder.mutationField('claim_git_job', (t) =>
  t.field({
    type: GitJobObject,
    nullable: true,
    args: { queues: t.arg.stringList({ required: true }) },
    resolve: async (_root, args, ctx) => {
      requireGitWorker(ctx.user)

      for (const queue of args.queues) {
        // Only hand out jobs from queues this worker knows how to run — a
        // stale worker asking for a since-removed queue gets nothing.
        if (!(GIT_JOB_QUEUES as readonly string[]).includes(queue)) continue
        const jobs = await boss.fetch(queue, { batchSize: 1 })
        const job = jobs?.[0]
        if (!job) continue

        // git-provision-repo / git-delete-repo: payload already carries
        // owner/repo directly (see jobs/provision-git-repo.ts /
        // jobs/delete-git-repo.ts).
        const { owner, repo } = job.data as ProvisionOrDeleteJobData
        return { id: job.id, queue, owner, repo }
      }

      return null
    },
  }),
)

builder.mutationField('complete_git_job', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      job_id: t.arg.id({ required: true }),
      queue: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      requireGitWorker(ctx.user)
      const jobId = String(args.job_id)

      await boss.complete(args.queue, jobId)
      return true
    },
  }),
)

builder.mutationField('fail_git_job', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      job_id: t.arg.id({ required: true }),
      queue: t.arg.string({ required: true }),
      error: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      requireGitWorker(ctx.user)
      const jobId = String(args.job_id)

      await boss.fail(args.queue, jobId, { error: args.error })
      return true
    },
  }),
)
