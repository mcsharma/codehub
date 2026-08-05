import { GraphQLError } from 'graphql'
import type { ModelUser } from '@prisma/client'
import { builder } from '../builder.js'
import { boss } from '../../jobs/boss.js'
import { GIT_LAND_REVIEW_QUEUE } from '../../jobs/queues.js'
import { resolveOwnerName } from './repository.js'

// Git-kind counterpart to hg-worker.ts. The VM worker (services/git/worker/)
// is the sole consumer of the git job queues — it polls claim_git_job,
// executes the op against its stack's own bare-repo volume (no SSH, no
// direct Postgres access, same reasoning as the hg worker), and reports back
// via complete_git_job/fail_git_job. Authenticated as a dedicated
// per-environment service-account PAT, same bearer-token mechanism `ch`
// and the hg worker already use.
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

interface LandGitReviewJobData {
  reviewId: string
}

interface GitJobShape {
  id: string
  queue: string
  owner: string
  repo: string
  sha: string | null
}

const GitJobObject = builder.objectRef<GitJobShape>('GitJob').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    queue: t.exposeString('queue'),
    owner: t.exposeString('owner'),
    repo: t.exposeString('repo'),
    // Only present for a git-land-review job — the sha to graft/fast-forward
    // onto refs/heads/master.
    sha: t.exposeString('sha', { nullable: true }),
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
        const jobs = await boss.fetch(queue, { batchSize: 1 })
        const job = jobs?.[0]
        if (!job) continue

        if (queue === GIT_LAND_REVIEW_QUEUE) {
          const { reviewId } = job.data as LandGitReviewJobData
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
          return { id: job.id, queue, owner: ownerName, repo: repo.name, sha: version.headNode }
        }

        // git-provision-repo / git-delete-repo: payload already carries
        // owner/repo directly (see jobs/provision-git-repo.ts /
        // jobs/delete-git-repo.ts).
        const { owner, repo } = job.data as ProvisionOrDeleteJobData
        return { id: job.id, queue, owner, repo, sha: null }
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
      landed_sha: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx) => {
      requireGitWorker(ctx.user)
      const jobId = String(args.job_id)

      if (args.queue === GIT_LAND_REVIEW_QUEUE) {
        const job = await boss.getJobById(args.queue, jobId)
        if (job) {
          const { reviewId } = job.data as LandGitReviewJobData
          await ctx.prisma.review.update({
            where: { id: BigInt(reviewId) },
            data: { status: 'LANDED', landedNode: args.landed_sha ?? null, landError: null },
          })
        }
      }

      await boss.complete(args.queue, jobId, args.landed_sha ? { landedSha: args.landed_sha } : {})
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

      if (args.queue === GIT_LAND_REVIEW_QUEUE) {
        const job = await boss.getJobById(args.queue, jobId)
        if (job) {
          const { reviewId } = job.data as LandGitReviewJobData
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
