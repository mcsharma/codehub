import { GraphQLError } from 'graphql'
import type { ModelUser } from '@prisma/client'
import { builder } from '../builder.js'
import { boss } from '../../jobs/boss.js'
import { HG_JOB_QUEUES } from '../../jobs/queues.js'

// The VM worker (services/hg/worker/) is the sole consumer of the hg job
// queues — it polls claim_hg_job, executes the op against its stack's own
// repo volume (no SSH, no direct Postgres access — see
// docs/plans/zesty-zooming-cupcake.md for the full design), and reports
// back via complete_hg_job/fail_hg_job. Authenticated as a dedicated
// per-environment service-account PAT, PAT bearer token on /graphql (see auth/personal-access-token.ts) — deliberately
// one token covering all three job types rather than the old three-separate
// SSH-keys split, since this is one process/container handling all three by
// design.
const HG_WORKER_USERNAME = 'codehub-hg-worker'

function requireHgWorker(user: ModelUser | null): ModelUser {
  if (!user || user.username !== HG_WORKER_USERNAME) {
    throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } })
  }
  return user
}

interface ProvisionOrDeleteJobData {
  owner: string
  repo: string
}

interface HgJobShape {
  id: string
  queue: string
  owner: string
  repo: string
}

const HgJobObject = builder.objectRef<HgJobShape>('HgJob').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    queue: t.exposeString('queue'),
    owner: t.exposeString('owner'),
    repo: t.exposeString('repo'),
  }),
})

builder.mutationField('claim_hg_job', (t) =>
  t.field({
    type: HgJobObject,
    nullable: true,
    args: { queues: t.arg.stringList({ required: true }) },
    resolve: async (_root, args, ctx) => {
      requireHgWorker(ctx.user)

      for (const queue of args.queues) {
        // Only hand out jobs from queues this worker knows how to run — a
        // stale worker asking for a since-removed queue gets nothing.
        if (!(HG_JOB_QUEUES as readonly string[]).includes(queue)) continue
        const jobs = await boss.fetch(queue, { batchSize: 1 })
        const job = jobs?.[0]
        if (!job) continue

        // provision-repo / delete-repo: payload already carries owner/repo
        // directly (see jobs/provision-repo.ts / jobs/delete-repo.ts).
        const { owner, repo } = job.data as ProvisionOrDeleteJobData
        return { id: job.id, queue, owner, repo }
      }

      return null
    },
  }),
)

builder.mutationField('complete_hg_job', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      job_id: t.arg.id({ required: true }),
      queue: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      requireHgWorker(ctx.user)
      const jobId = String(args.job_id)

      await boss.complete(args.queue, jobId)
      return true
    },
  }),
)

builder.mutationField('fail_hg_job', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      job_id: t.arg.id({ required: true }),
      queue: t.arg.string({ required: true }),
      error: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      requireHgWorker(ctx.user)
      const jobId = String(args.job_id)

      await boss.fail(args.queue, jobId, { error: args.error })
      return true
    },
  }),
)
