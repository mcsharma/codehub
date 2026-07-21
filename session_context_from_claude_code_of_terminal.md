# Session context — carried over from a terminal Claude Code session

Written 2026-07-21. This file exists purely to hand off context to a fresh
Claude Code session (e.g. in the VS Code extension) — the terminal CLI and
VS Code extension keep separate session histories, so this is a manual
bridge. Safe to delete once no longer useful.

## Infrastructure overview

Two things are deployed, both under the `greensnippet.com` domain (GoDaddy
DNS, purchased this session):

1. **hgweb CLI door** — a Mercurial (`hg`) server for `hg clone`/`push`,
   on a self-managed DigitalOcean VM.
2. **CodeHub web app** (`web/` — Express/GraphQL BFF + React/Relay
   frontend) — deployed to Railway, with a Railway-managed Postgres DB.

## 1. hgweb (DigitalOcean VM)

- VM: `143.110.207.184`, user `root`, SSH already set up.
- Domain: `hg.greensnippet.com` → nginx (TLS via certbot/Let's Encrypt,
  auto-renews) → nginx basic auth → gunicorn (venv at
  `/opt/hgservice/venv`, systemd service `hgweb`, user `hgservice`) →
  hgweb (Mercurial's WSGI app) → repos on disk at `/data/repos/{tenant}/{repo}/`.
- Config is checked into this repo at `services/hg/` (`hgweb.ini`,
  `hgweb_wsgi.py`, `hgweb.service`, `nginx-hgweb.conf`) — see
  `services/hg/README.md` for deploy paths and redeploy commands.
- **Auth**: nginx basic auth is a stopgap (single shared username/password
  in `/etc/nginx/.htpasswd` on the VM — not committed anywhere; regenerate
  with `htpasswd -bc /etc/nginx/.htpasswd <user> '<pass>'` if needed).
  hgweb itself still has `allow_push = *`, so anyone with the basic-auth
  password can push to *any* tenant's repo — real per-tenant permission
  checks (`/internal/auth-check` in the BFF + nginx `auth_request`) are
  a deliberate, not-yet-built follow-up. Currently `/internal/auth-check`
  in `web/bff/src/index.ts` is a stub that always returns 200.
- Verified working end-to-end: clone/commit/push from a local machine
  over the public HTTPS domain with basic auth.

## 2. Web app (Railway)

- Railway project: `capable-vibrancy` (Hobby plan). Service:
  `codehub-web`, source = GitHub repo `mcsharma/codehub` (private),
  branch `main`, root directory `web`, Railpack builder.
  - Build command: `pnpm install && pnpm run build`
  - Start command: `node bff/dist/index.js`
  - `preDeployCommand`: `pnpm --filter @codehub/bff run migrate:deploy`
    (runs `prisma migrate deploy` before every deploy — wired up this
    session so schema changes apply automatically on push).
- Postgres: Railway-managed service `Postgres-Chkg` in the same project.
  `DATABASE_URL` on `codehub-web` references it via
  `${{Postgres-Chkg.DATABASE_URL}}` (private network, not publicly
  exposed — no TCP proxy left open).
- **Auto-deploy confirmed working**: pushing to `main` on GitHub triggers
  a Railway build automatically (no manual CLI trigger needed). The
  Railway GitHub App needed to be explicitly authorized for this repo
  since it's private (done via Railway dashboard → service → Settings →
  Source → reconnect).
- Domains:
  - `www.greensnippet.com` → CNAME to Railway, TLS cert issued and
    valid.
  - `greensnippet.com` (bare/apex) → GoDaddy **Forwarding** (301) to
    `https://www.greensnippet.com`. GoDaddy's DNS panel rejects a CNAME
    at the apex (`@`), and apex domain also had a GoDaddy "Website
    Builder" product attached that had to be disconnected before
    Forwarding would actually take effect (it was overriding DNS with
    GoDaddy's own placeholder site).
  - Both verified serving the real app end-to-end, including GraphQL.
- Railway CLI is installed locally (`brew install railway`), logged in,
  and linked to this project from `/Users/maheshsharma/Projects/codehub/services`
  (the link is directory-scoped — run Railway CLI commands from that
  directory, or re-link). A Railway MCP server + `use-railway` skill
  were also installed (`railway setup agent -y`) but need a Claude Code
  restart to register — untested from within a session.

## Bugs found and fixed this session (all committed to `main`)

These only surfaced once actually deployed to production — local dev
(`tsx watch`) masked all three:

1. **`@bff/*` path alias didn't survive compilation.** It was a
   TypeScript-only `tsconfig.json` `paths` alias; `tsc` doesn't rewrite
   it in emitted JS, so `node bff/dist/index.js` crashed with
   `ERR_MODULE_NOT_FOUND`. Fixed by replacing every `@bff/*` import
   with a real relative import and dropping the alias config.
2. **Dev-only codegen crashed prod.** `bff/src/index.ts` unconditionally
   wrote `./src/__generated__/schema.graphql` (a relative-path
   convenience for the frontend's Relay compiler) on every boot — threw
   `ENOENT` in the production container and crash-looped. Now gated
   behind `NODE_ENV !== 'production'`.
3. **`prisma/seed.ts` referenced the removed `Commit` model** (see
   below) and would have failed outright. Fixed, and bumped the
   `$transaction` timeout to 20s (the 5s default was too tight once
   seeding over a real network connection instead of localhost).

## GitHub integration removed

The user is dropping the GitHub integration entirely. Removed this
session: `bff/src/pothos/schema/github.ts`, `commit.ts`, the `Commit`
Prisma model, `frontend/src/pages/GitHubRepoPage.tsx`, and all
references in `App.tsx`/`router.tsx`. The Express OAuth routes
(`/auth/github*`) in `bff/src/index.ts` were removed earlier in the
session, before the schema/frontend cleanup.

## DB migrations

The project had never actually deployed to a real Postgres before this
session, so rather than layering an additive migration on top of the
stale `0_init` (which still had the `Commit` table), the single init
migration was **regenerated from scratch** to match the current schema
(`web/bff/prisma/migrations/20260721014522_init/`). This is safe
specifically *because* no production data existed yet — don't repeat
this "redo init" approach once there's real user data; use additive
migrations from here on.

## Sample data

Production DB has been seeded (`pnpm run seed` from `web/bff`, or via
Railway with a temporary TCP proxy — see below): 2 organizations, 4
users, 6 repositories. Verified live via GraphQL on
`www.greensnippet.com/graphql`.

To reseed later: from `web/bff`, either run against a temporary public
Postgres connection (`railway tcp-proxy create --service Postgres-Chkg
--port 5432`, grab `DATABASE_PUBLIC_URL` via `railway variable list
--service Postgres-Chkg --json`, run `DATABASE_URL="..." npx tsx
prisma/seed.ts`, then **delete the TCP proxy again** —
`railway tcp-proxy delete <id> --service Postgres-Chkg --yes`), or SSH
into the running container (`railway ssh --service codehub-web`, but
this requires registering a local SSH key with Railway first, which
wasn't done this session on purpose — it grants standing shell access).

## Not done / open follow-ups

- Real auth (`/internal/auth-check` logic, hg per-tenant permissions) —
  still a stub, explicitly deferred both in the hg design doc and here.
- No new DB migration workflow tested yet beyond the one redo — next
  schema change should be a normal additive migration
  (`pnpm --filter @codehub/bff migrate` locally, commit the generated
  migration file, push).
