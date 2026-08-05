# git service config

Git repo hosting on the same DigitalOcean VM as `services/hg/`
(143.110.207.184), added as a second, purely-additive VCS option — see
`docs/plans/zesty-zooming-cupcake.md` for the full design and why. Mirrors
`services/hg/`'s architecture closely: shell out to the real `git` binary
(never a reimplementation library), one Docker Compose stack per
environment, nginx `auth_request` gating against the same BFF, and pg-boss
job queues claimed by a VM-side worker over GraphQL (no SSH, no direct
Postgres access).

## Two stacks, one VM (shared with the hg stacks)

`codehub-git-prod` and `codehub-git-test`, each with its own `git-app`
(git-http-backend via fcgiwrap), `git-proxy` (nginx), `worker`, and
on-disk repos directory (`/data/git-repos-prod` / `/data/git-repos-test`).

| Directory | Purpose |
|-----------|---------|
| `Dockerfile`/`etc/gitconfig`/`hooks/` | The git-app image — same one built for both stacks. |
| `worker/` | The job worker image — same one built for both stacks. |
| `vm/docker-compose.prod.yml` / `docker-compose.test.yml` | Per-stack compose files. |
| `vm/nginx-prod.conf` / `nginx-test.conf.template` | Per-stack nginx config. |

## No client tooling — review creation is server-side

Unlike hg's `ch submit`, there is no custom CLI for git repos. Users push
with plain `git`/Sapling (`sl`) to a `refs/reviews/<40-hex-sha>` ref (the
git-ref analog of hg's `reviews/<12-hex-node>` bookmark). The bare repo's
`post-receive` hook (`hooks/post-receive`) detects the push and calls the
BFF's `report_git_review_push` mutation itself
(`web/bff/src/pothos/schema/git-review.ts`) to create/update the
`Review`/`ReviewVersion` rows — same Prisma models hg reviews already use.
`hooks/pre-receive` enforces the same push-time restriction hg's
`hg_hooks.py` does: `refs/heads/master` can never be pushed to directly
(it only moves via the worker's `landGitReview` op, on-disk, never over the
wire protocol), and every other push must be a `refs/reviews/<sha>` ref.

Pusher identity for `report_git_review_push`'s `Review.authorId` is
plumbed through: `/internal/auth-check` sets an `X-CodeHub-User` response
header, nginx captures it via `auth_request_set` and forwards it as
`REMOTE_USER` in the fastcgi params to `git-http-backend`, which passes it
through to `git-receive-pack`'s hook environment.

## Landing

Bare repos have no working tree, so `git cherry-pick` doesn't apply
directly. `landGitReview` (`worker/src/ops.ts`) uses tree-level plumbing
instead — `git merge-tree --write-tree` (needs git ≥2.38) for the
3-way-merge-equivalent of a graft, `git commit-tree` to construct the
landed commit (preserving the original author, committer set to
`CodeHub <noreply@codehub>`), and `git update-ref` (with an old-value
compare-and-swap) to move `refs/heads/master`.

## No seed commit

Unlike `provisionRepo`'s hg equivalent (which seeds a public root commit
specifically because `ch submit`'s automatic `hg metaedit` can turn a
parentless draft commit into a disconnected root that hg's push then
refuses), `provisionGitRepo` doesn't need one — nothing auto-rewrites a
user's commits server-side here, and `git push` has no "unrelated
histories" push-time rejection. See `docs/plans/zesty-zooming-cupcake.md`'s
"Key design decisions" #4 for the full reasoning.

## Auth

Same layering as the hg stacks: `git-http-backend`/fcgiwrap trust every
request that reaches them (`GIT_HTTP_EXPORT_ALL` is set, no per-repo
`git-daemon-export-ok` gating); real per-tenant permission checks happen
one layer up, in nginx's `auth_request /internal/auth-check` against the
same BFF route hg uses — it classifies git's smart-HTTP read/write by path
(`git-receive-pack` = write) instead of hg's `cmd=unbundle`, but calls the
exact same `canAccessRepo`.

Two service accounts, not one — least-privilege: `codehub-git-worker`
(claims/completes/fails provision/delete/land jobs, seeded via
`web/bff/scripts/seed-git-worker.mjs`) and `codehub-git-hook` (only calls
`report_git_review_push`, seeded via `web/bff/scripts/seed-git-hook.mjs`).
The hook container is directly internet-facing (it's what `git push` hits),
so a leaked hook token shouldn't be able to touch the job queues.

## Prod port

`git.greensnippet.com` on a **non-standard port** (`8443`), not 443 —
`hgweb-proxy` already owns host 80/443 on this VM, and merging git's prod
nginx into a shared edge proxy with hg's would reintroduce the cross-stack
coupling the per-stack `deploy.sh` directory isolation exists to prevent.
Git access is always CLI-driven, so a port in the remote URL costs nothing
the way it would for a browsed website — and since hg is expected to be
removed at some point after git support lands, this also avoids building
shared-infra machinery that would just get unwound shortly after.

TLS for `git.greensnippet.com` needs a **DNS-01** Certbot challenge (or a
one-off port-80 listener during issuance/renewal) — the HTTP-01 default
validates over port 80, which this server doesn't listen on. Not automated
here; a manual one-time setup step, same as pointing DNS at the VM in the
first place.

## Redeploying a change

```bash
./deploy.sh test          # or ./deploy.sh test --dry-run to preview first
./deploy.sh prod          # deploy prod separately, once test looks good
```

One stack per invocation, deliberately — same reasoning as
`services/hg/deploy.sh`. Rsyncs this directory to the VM (per-stack
directory, not shared — see `deploy.sh`'s own comments) and runs
`docker compose build && up -d` for just the named stack.

One-time VM setup (do before the first deploy): `/data/git-repos-prod` and
`/data/git-repos-test` created, `.env.prod`/`.env.test` and
`vm/hook-config.prod.env`/`hook-config.test.env` populated from the
`.example` files in `vm/` (secrets, not committed — see root `.gitignore`),
`git.greensnippet.com` DNS pointed at the VM and its TLS cert issued (see
"Prod port" above).
