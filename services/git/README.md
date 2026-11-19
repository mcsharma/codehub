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
| `browse/` | The commit/diff/directory browsing service — see "Browsing" below. |
| `vm/docker-compose.prod.yml` / `docker-compose.test.yml` | Per-stack compose files. |
| `vm/nginx-prod.conf` / `nginx-test.conf.template` | Per-stack nginx config. |

## Push rules

Users push with plain `git` or Sapling (`sl`); there's no review step or
custom client. `hooks/pre-receive` allows any ref to be created, updated,
force-pushed or deleted, except `refs/heads/master`, which can't be deleted
and can only fast-forward. Same policy as hg's `hg_hooks.py`.

Repos are created with no commits (`git init --bare --initial-branch=master`)
and the Code tab shows `master`.

`/internal/auth-check` sets an `X-CodeHub-User` response header, and nginx
forwards it to `git-http-backend` as `REMOTE_USER`. This is load-bearing:
`git-http-backend` only enables `receive-pack` (push) when `REMOTE_USER` is
set.

`cleanup-reviews.sh` is a one-off for removing leftovers from the old code
review feature (`refs/reviews/*` refs and the commits only they kept alive).
Dry run by default: `./cleanup-reviews.sh <prod|test> [--apply]`.

## Browsing

Unlike hgweb (Mercurial's bundled JSON web server — see
`services/hg/hgweb_wsgi.py`, which is two lines, no custom code), git's
`git-http-backend` is smart-HTTP dumb-protocol only: clone/push, no
commit/diff/directory browsing API. `browse/` is a small custom HTTP
service (Node, `execFile('git', ...)`, mirrors `worker/`'s stack) that
gives git repos the same browsing capability hgweb gives hg repos for
free — shells out to `git log`/`show`/`ls-tree`/`diff`/`cat-file` against
the same read-only-mounted bare-repos volume `git-app`/`worker` use.

Reached via `git-proxy`'s existing public port (8443 prod / 8002 test), not
a new one — a new nginx `location ~ ^/[^/]+/[^/]+/_browse/` block
`proxy_pass`es to the internal-only `git-browse` container, behind the same
`auth_request /internal/auth-check` gate as everything else on that port.
The BFF authenticates its own calls with `GIT_INTERNAL_TOKEN` (a new shared
secret, separate from `HG_INTERNAL_TOKEN`, checked by the same
`/internal/auth-check` route) — see `web/bff/src/repos/
git-browse-client.ts`, and `web/bff/.env.example` for `GIT_BROWSE_BASE`/
`GIT_INTERNAL_TOKEN`. Full design in
`docs/plans/zesty-zooming-cupcake.md`.

Not yet supported: browsing branches other than `master`, or tags.

## Auth

Same layering as the hg stacks: `git-http-backend`/fcgiwrap trust every
request that reaches them (`GIT_HTTP_EXPORT_ALL` is set, no per-repo
`git-daemon-export-ok` gating); real per-tenant permission checks happen
one layer up, in nginx's `auth_request /internal/auth-check` against the
same BFF route hg uses — it classifies git's smart-HTTP read/write by path
(`git-receive-pack` = write) instead of hg's `cmd=unbundle`, but calls the
exact same `canAccessRepo`.

The worker authenticates as the `codehub-git-worker` service account
(claims/completes/fails provision/delete jobs, seeded via
`web/bff/scripts/seed-git-worker.mjs`).

## Prod port

`git.greensnippet.com` on a **non-standard port** (`8443`), not 443 —
`hgweb-proxy` already owns host 80/443 on this VM, and merging git's prod
nginx into a shared edge proxy with hg's would reintroduce the cross-stack
coupling the per-stack `deploy.sh` directory isolation exists to prevent.
Git access is always CLI-driven, so a port in the remote URL costs nothing
the way it would for a browsed website — and since hg is expected to be
removed at some point after git support lands, this also avoids building
shared-infra machinery that would just get unwound shortly after.

TLS for `git.greensnippet.com` is a Let's Encrypt cert, **auto-renewed** by the
VM's `certbot.timer` using the `standalone` authenticator (HTTP-01 on port
80). Port 80 on this VM is owned by `codehub-prod-hgweb-proxy-1` (hg's nginx),
so the renewal config carries hooks that free and restore it:

- `pre_hook`: `docker stop codehub-prod-hgweb-proxy-1`
- `post_hook`: `docker start codehub-prod-hgweb-proxy-1 && docker restart
  codehub-git-prod-git-proxy-1` (restart is needed so nginx loads the new cert)

hg's cert (`hg.greensnippet.com`) uses the identical setup — this is also why
`certbot renew` previously failed for hg: it was configured with the `nginx`
authenticator, which drives a host nginx that no longer exists now that nginx
runs in Docker. Each renewal causes a few seconds of hg/git unavailability.

Both certs were reissued this way on 2026-11-18 (expire 2027-02-16; certbot
renews ~30 days before expiry). To check or reissue by hand:

```bash
ssh root@143.110.207.184 certbot certificates
ssh root@143.110.207.184 certbot renew --dry-run   # note: certbot sleeps up to ~5 min first
```

If renewal ever breaks again, the symptom is TLS errors on `hg.`/`git.`
while `www.` (Railway) stays fine.

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
`/data/git-repos-test` created, `.env.prod`/`.env.test` populated from the
`.example` files in `vm/` (secrets, not committed — see root `.gitignore`),
`git.greensnippet.com` DNS pointed at the VM and its TLS cert issued (see
"Prod port" above).
