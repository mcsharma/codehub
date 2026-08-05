// Queue names shared between the enqueue side (repository.ts/review.ts via
// provision-repo.ts/delete-repo.ts/land-review.ts) and the claim/complete/fail
// side (pothos/schema/hg-worker.ts) — kept in one place so the VM-side worker
// and the BFF always agree on the literal strings pg-boss uses as queue names.
export const PROVISION_REPO_QUEUE = 'provision-repo'
export const DELETE_REPO_QUEUE = 'delete-repo'
export const LAND_REVIEW_QUEUE = 'land-review'

export const HG_JOB_QUEUES = [PROVISION_REPO_QUEUE, DELETE_REPO_QUEUE, LAND_REVIEW_QUEUE] as const

// Same shape as the HG_* queues above, but for git-kind repos — claimed by
// services/git/worker/ instead of services/hg/worker/. Kept as separate
// constants/queues rather than parameterizing the hg ones, so the existing
// hg queue names/behavior never change.
export const GIT_PROVISION_REPO_QUEUE = 'git-provision-repo'
export const GIT_DELETE_REPO_QUEUE = 'git-delete-repo'
export const GIT_LAND_REVIEW_QUEUE = 'git-land-review'

export const GIT_JOB_QUEUES = [GIT_PROVISION_REPO_QUEUE, GIT_DELETE_REPO_QUEUE, GIT_LAND_REVIEW_QUEUE] as const
