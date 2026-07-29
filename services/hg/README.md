# hgweb service config

Config for the hgweb CLI door running on the DigitalOcean VM at
143.110.207.184 (`hg.greensnippet.com`). Mirrors what's actually deployed;
edit here and re-deploy, don't hand-edit on the box.

## Files → deploy paths

| File                 | Deploy path                          |
|-----------------------|---------------------------------------|
| `hgweb.ini`           | `/etc/hgweb.ini`                     |
| `hgweb_wsgi.py`       | `/opt/hgservice/hgweb_wsgi.py`       |
| `hg_hooks.py`         | `/opt/hgservice/hg_hooks.py`         |
| `hgweb.service`       | `/etc/systemd/system/hgweb.service`  |
| `nginx-hgweb.conf`    | `/etc/nginx/sites-enabled/hgweb`     |
| `create-repo.sh`      | `/opt/hgservice/create-repo.sh`      |
| `delete-repo.sh`      | `/opt/hgservice/delete-repo.sh`      |
| `land-review.sh`      | `/opt/hgservice/land-review.sh`      |

`create-repo.sh`, `delete-repo.sh`, and `land-review.sh` are forced-command
targets for three *separate* dedicated SSH keys the BFF uses to provision,
remove, and land into repos on demand (see
`web/bff/src/repos/provision-on-vm.ts` / `delete-on-vm.ts` / `land-on-vm.ts`)
— each installed in `hgservice`'s `authorized_keys` with its own
`command="..."` entry (`HG_VM_DEPLOY_KEY` → `create-repo.sh` only,
`HG_VM_DELETE_KEY` → `delete-repo.sh` only, `HG_VM_LAND_KEY` →
`land-review.sh` only), so any one key can never run anything but its one
script. Deliberately not shared: a leaked create key can only create junk
repos, a leaked delete key could destroy any repo on the box, and a leaked
land key could only merge already-pushed, already-reviewed changesets onto
`master` — each stays on its own key with its own blast radius. None of
these is the human deploy key used for the commands below.

## Code review / landing

The code-review feature (see the top-level `cli/` Deno tool, `ch`) pins
reviews to real changeset hashes rather than storing patch snapshots — see
`web/bff/src/repos/hgweb-client.ts` and `web/bff/src/pothos/schema/review.ts`.
Two pieces of server-side hg config exist purely to keep that model safe:

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
  *because* `master` only ever moves through `land-review.sh`, which
  operates directly on the repo on disk and never goes through the push
  wire protocol at all — there's never a legitimate push to `master` for
  the hook to have to let through.

## Stack

TLS (Let's Encrypt via certbot, auto-renews) → nginx (basic auth) →
gunicorn (venv at `/opt/hgservice/venv`, `hgservice` system user) →
hgweb → `/data/repos/{tenant}/{repo}/`.

`hgweb.ini` uses `/data/repos/**` (recursive glob) to pick up the
nested tenant/repo layout — Mercurial doesn't support `*/*`.

`hgweb_wsgi.py` passes the config path as `bytes` (`b'/etc/hgweb.ini'`),
required on this Mercurial/Python version.

## Auth

`hgweb.ini`'s own `allow_push = *` means hgweb itself trusts every
request — real per-tenant permission checks happen one layer up, in
nginx: every request goes through `auth_request /internal/auth-check`
(see `nginx-hgweb.conf`), proxied to the BFF's `/internal/auth-check`
route, which resolves the `{owner}/{repo}` in the request path and checks
the caller's PAT (or the BFF's own shared `HG_INTERNAL_TOKEN`, for its own
commit/bookmark browsing calls) against real per-repo visibility/admin
state in Postgres before nginx ever proxies through to hgweb.

## Local dev

`web/docker-compose.yml` runs a local stand-in for this whole stack —
`hgweb-app` (built from `Dockerfile.local`, bind-mounts this directory's
`hgweb.ini`/`hgweb_wsgi.py` unmodified so local never drifts from what's
deployed here) behind `hgweb-proxy` (plain `nginx:alpine` running
`nginx-hgweb.local.conf`, this directory's version of
`nginx-hgweb.conf` with TLS/certbot dropped). Repos live on the host at
`local-data/repos/` (gitignored) instead of the VM's `/data/repos/`.

Permission checks are **not** simplified locally — `nginx-hgweb.local.conf`
runs the same `auth_request` against the same BFF route
(`/internal/auth-check`) as prod, just reached via `host.docker.internal`
instead of the public domain. That means the local BFF (`pnpm dev`, port
4000) must be running for `hg clone`/`push`/browsing to work at all, not
just for the GraphQL API — and a repo your local-DB user doesn't have
access to correctly 401s locally too. Only TLS is skipped, since there's
no certificate to issue for `localhost`.

Repo creation doesn't SSH anywhere locally either: `HG_LOCAL_REPOS_DIR`
being set in `web/bff/.env` switches `create_repository` to run `hg init`
directly against `local-data/repos/` (see
`web/bff/src/repos/provision-local.ts`) instead of calling
`provisionRepoOnVm`. Unset both `HG_WEB_BASE` and `HG_LOCAL_REPOS_DIR` to
point local dev back at prod's hgweb/VM instead.

```bash
docker compose -f web/docker-compose.yml up -d db hgweb-app hgweb-proxy
```

## Redeploying a change

```bash
./deploy.sh          # or ./deploy.sh --dry-run to preview first
```

Change-detects each file in the table above against what's already on the VM
(sha256, over SSH) and only touches the service(s) actually affected —
`hgweb.ini`/`hgweb_wsgi.py`/`hgweb.service` changes restart `hgweb`
(`daemon-reload` first if the unit file itself changed), `nginx-hgweb.conf`
changes run `nginx -t` before reloading. Verifies `hgweb` is active again
after a restart; fails loudly if not.
