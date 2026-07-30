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

Three privileged operations hgweb's HTTP API doesn't expose — `hg init`,
moving the `master` bookmark, and marking it public — used to be reached by
the BFF SSHing into the VM and running a forced-command script per
operation. That's gone. Instead:

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
  containers, over HTTPS, authenticated the same way the `ch` CLI already
  is.

This is also why local dev and prod are finally the same code path: there's
only one implementation of provision/delete/land now (`worker/src/ops.ts`),
run by whichever stack's worker container claims the job.

## Code review / landing

The code-review feature (see the top-level `cli/` Deno tool, `ch`) pins
reviews to real changeset hashes rather than storing patch snapshots — see
`web/bff/src/repos/hgweb-client.ts` and `web/bff/src/pothos/schema/review.ts`.
Two pieces of server-side hg config exist purely to keep that model safe,
identical in both stacks:

- **`[phases] publish = False`** in `hgweb.ini` — keeps every pushed
  changeset in the `draft` phase so authors can still amend/rebase them
  locally after `ch submit`. A publishing server (hg's normal default for a
  server repo) would mark them `public` on arrival, and `public` changesets
  are meant to be treated as immutable.
- **`hg_hooks.py`'s `prepushkey` hook** — rejects any pushed bookmark move
  that isn't a `reviews/<12-hex-node>` bookmark (the shape `ch submit`
  always uses, one per submitted changeset, never reused/force-moved — see
  `cli/src/commands/submit.ts`). In particular, `master` — the mainline
  pointer diffs land onto and releases cut from — can never be moved by an
  ordinary push, from anyone, with no exception. That's safe specifically
  *because* `master` only ever moves through the worker's `landReview` op,
  which operates directly on the repo on disk and never goes through the
  push wire protocol at all — there's never a legitimate push to `master`
  for the hook to have to let through.

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
./deploy.sh          # or ./deploy.sh --dry-run to preview first
```

Rsyncs this directory to the VM and runs `docker compose build && up -d`
for both stacks. Bind-mounted config (`hgweb.ini`/`hg_hooks.py`/nginx
configs) takes effect on container restart without a rebuild; changes to
`Dockerfile` or `worker/` do need the rebuild `deploy.sh` already
does unconditionally (both images build fast enough that change-detection
isn't worth the complexity it used to have when this was scp'd file-by-file
to a native systemd setup).

One-time VM setup (already done, documented for reference): Docker +
Compose plugin installed, `/data/repos-prod` and `/data/repos-test`
created, `.env.prod`/`.env.test` populated from the `.example` files in
`vm/` (secrets, not committed — see `vm/.gitignore`).
