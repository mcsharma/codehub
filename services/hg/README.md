# hgweb service config

Config for hgweb running on the DigitalOcean VM at 143.110.207.184. Mirrors
what's actually deployed; edit here and re-deploy (`./deploy.sh`), don't
hand-edit on the box.

## Two stacks, one VM

The VM runs two independent Docker Compose stacks — `codehub-prod` and
`codehub-test` — each with its own `hgweb-app` (gunicorn+hgweb), `hgweb-proxy`
(nginx), `worker`, and on-disk repos directory (`/data/repos-prod` /
`/data/repos-test`). "Local dev" points at the `test` stack instead of
running anything hg-related on the laptop — see `web/docker-compose.yml`
(now just the BFF, if that) and `web/bff/.env.example`.

| Directory                  | Purpose                                            |
|-----------------------------|-----------------------------------------------------|
| `hgweb.ini`/`hgweb_wsgi.py`/`hg_hooks.py`/`Dockerfile` | The hgweb image — same one built for both stacks. |
| `worker/`                   | The job worker image — same one built for both stacks. |
| `vm/docker-compose.prod.yml` / `docker-compose.test.yml` | Per-stack compose files (ports, volumes, env). |
| `vm/nginx-prod.conf` / `nginx-test.conf.template`         | Per-stack nginx config. |

## No more SSH

Privileged operations hgweb's HTTP API doesn't expose — creating and
deleting repos — used to be reached by the BFF SSHing into the VM and
running a forced-command script per operation. That's gone. Instead:

- Each stack's `worker` container polls that stack's BFF over GraphQL
  (`claim_hg_job`/`complete_hg_job`/`fail_hg_job` — see
  `web/bff/src/pothos/schema/hg-worker.ts`), authenticated as a reserved
  `codehub-hg-worker` service-account PAT (seeded once per environment via
  `web/bff/scripts/seed-hg-worker.mjs`, token goes into that stack's
  `.env.prod`/`.env.test` as `HG_WORKER_TOKEN`).
- On a claimed job it runs the op directly against its own mounted repos
  volume (`worker/src/ops.ts` — ported from what used to be the BFF's
  local-dev-only direct-fs code) and reports back.
- The BFF never SSHes anywhere, and the VM never touches Postgres directly
  — only ever receives outbound-initiated GraphQL calls from the worker
  containers, over HTTPS, authenticated with a PAT bearer token.

This is also why local dev and prod are finally the same code path: there's
only one implementation of provision/delete now (`worker/src/ops.ts`),
run by whichever stack's worker container claims the job.

## Push rules

Pushes go straight to the repo with plain `hg push`; there's no review
step. `hg_hooks.py`'s `prepushkey` hook lets any bookmark be created, moved
or deleted, with one exception: `master` can't be deleted, and can only
move forward (to a descendant of where it was), the hg equivalent of git's
"no force-push". Same policy as the git stack's `pre-receive` hook.

The server is publishing (hg's default), so pushed changesets become
`public`.

`cleanup-reviews.sh` is a one-off for removing leftovers from the old code
review feature (`reviews/*` bookmarks and never-landed draft changesets).
Dry run by default: `./cleanup-reviews.sh <prod|test> [--apply]`.

## Auth

`hgweb.ini`'s own `allow_push = *` means hgweb itself trusts every
request — real per-tenant permission checks happen one layer up, in
nginx: every request goes through `auth_request /internal/auth-check`
(see `vm/nginx-prod.conf` / `nginx-test.conf.template`), proxied to that
stack's BFF's `/internal/auth-check` route, which resolves the
`{owner}/{repo}` in the request path and checks the caller's PAT (or the
BFF's own shared `HG_INTERNAL_TOKEN`, for its own commit/bookmark browsing
calls) against real per-repo visibility/admin state in Postgres before
nginx ever proxies through to hgweb.

## Redeploying a change

```bash
./deploy.sh test          # or ./deploy.sh test --dry-run to preview first
./deploy.sh prod          # deploy prod separately, once test looks good
```

One stack per invocation, deliberately — deploy `test`, verify it, then
`prod`, rather than always shipping both together sight-unseen. Rsyncs
this directory to the VM (harmless to do for either stack — both build
from the same synced source) and runs `docker compose build && up -d` for
just the stack you named. Bind-mounted config (`hgweb.ini`/`hg_hooks.py`/
nginx configs) takes effect on container restart without a rebuild;
changes to `Dockerfile` or `worker/` do need the rebuild `deploy.sh`
already does unconditionally (the image builds fast enough that change-
detection isn't worth the complexity it used to have when this was scp'd
file-by-file to a native systemd setup).

One-time VM setup (already done, documented for reference): Docker +
Compose plugin installed, `/data/repos-prod` and `/data/repos-test`
created, `.env.prod`/`.env.test` populated from the `.example` files in
`vm/` (secrets, not committed — see `vm/.gitignore`).
