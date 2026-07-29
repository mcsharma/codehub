// Queue names shared between the enqueue side (repository.ts/review.ts via
// provision-repo.ts/delete-repo.ts/land-review.ts) and the claim/complete/fail
// side (pothos/schema/hg-worker.ts) — kept in one place so the VM-side worker
// and the BFF always agree on the literal strings pg-boss uses as queue names.
export const PROVISION_REPO_QUEUE = 'provision-repo'
export const DELETE_REPO_QUEUE = 'delete-repo'
export const LAND_REVIEW_QUEUE = 'land-review'

export const HG_JOB_QUEUES = [PROVISION_REPO_QUEUE, DELETE_REPO_QUEUE, LAND_REVIEW_QUEUE] as const
