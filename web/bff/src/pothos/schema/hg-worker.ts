import { GraphQLError } from 'graphql'
import type { ModelUser } from '@prisma/client'
import { builder } from '../builder.js'
import { boss } from '../../jobs/boss.js'
import { LAND_REVIEW_QUEUE } from '../../jobs/queues.js'
import { resolveOwnerName } from './repository.js'

// The VM worker (services/hg/worker/) is the sole consumer of the hg job
// queues — it polls claim_hg_job, executes the op against its stack's own
// repo volume (no SSH, no direct Postgres access — see
// docs/plans/zesty-zooming-cupcake.md for the full design), and reports
// back via complete_hg_job/fail_hg_job. Authenticated as a dedicated
// per-environment service-account PAT, same bearer-token mechanism `ch`
// already uses on /graphql (see auth/personal-access-token.ts) — deliberately
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

interface LandReviewJobData {
  reviewId: string
}

interface HgJobShape {
  id: string
  queue: string
  owner: string
  repo: string
  node: string | null
}

const HgJobObject = builder.objectRef<HgJobShape>('HgJob').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    queue: t.exposeString('queue'),
    owner: t.exposeString('owner'),
    repo: t.exposeString('repo'),
    // Only present for a land-review job — the node to graft/fast-forward
    // onto master.
    node: t.exposeString('node', { nullable: true }),
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
        const jobs = await boss.fetch(queue, { batchSize: 1 })
        const job = jobs?.[0]
        if (!job) continue

        if (queue === LAND_REVIEW_QUEUE) {
          const { reviewId } = job.data as LandReviewJobData
          const review = await ctx.prisma.review.findUnique({ where: { id: BigInt(reviewId) } })
          if (!review) {
            // Review was deleted/abandoned out from under the job — nothing
            // to land, don't retry.
            await boss.fail(queue, job.id, { error: 'review no longer exists' })
            continue
          }
          const repo = await ctx.prisma.repository.findUniqueOrThrow({ where: { id: review.repositoryId } })
          const version = await ctx.prisma.reviewVersion.findFirst({
            where: { reviewId: review.id },
            orderBy: { version: 'desc' },
          })
          if (!version) {
            await ctx.prisma.review.update({
              where: { id: review.id },
              data: { status: 'LAND_FAILED', landError: 'No submitted version to land' },
            })
            await boss.fail(queue, job.id, { error: 'no submitted version' })
            continue
          }
          const ownerName = await resolveOwnerName(repo, ctx.prisma)
          return { id: job.id, queue, owner: ownerName, repo: repo.name, node: version.headNode }
        }

        // provision-repo / delete-repo: payload already carries owner/repo
        // directly (see jobs/provision-repo.ts / jobs/delete-repo.ts).
        const { owner, repo } = job.data as ProvisionOrDeleteJobData
        return { id: job.id, queue, owner, repo, node: null }
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
      landed_node: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx) => {
      requireHgWorker(ctx.user)
      const jobId = String(args.job_id)

      if (args.queue === LAND_REVIEW_QUEUE) {
        const job = await boss.getJobById(args.queue, jobId)
        if (job) {
          const { reviewId } = job.data as LandReviewJobData
          await ctx.prisma.review.update({
            where: { id: BigInt(reviewId) },
            data: { status: 'LANDED', landedNode: args.landed_node ?? null, landError: null },
          })
        }
      }

      await boss.complete(args.queue, jobId, args.landed_node ? { landedNode: args.landed_node } : {})
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

      if (args.queue === LAND_REVIEW_QUEUE) {
        const job = await boss.getJobById(args.queue, jobId)
        if (job) {
          const { reviewId } = job.data as LandReviewJobData
          await ctx.prisma.review.update({
            where: { id: BigInt(reviewId) },
            data: { status: 'LAND_FAILED', landError: args.error },
          })
        }
      }

      await boss.fail(args.queue, jobId, { error: args.error })
      return true
    },
  }),
)
