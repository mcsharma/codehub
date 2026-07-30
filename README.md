# CodeHub

An AI-first, Mercurial-based code review platform: browse repos, submit
commit stacks for review, and land them onto `master` through a review-gated
workflow (see `services/hg/README.md` for the full design).

## Components

| Component      | What it is                                                                                              | Where                                     |
| -------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **frontend**   | React + Vite single-page app                                                                            | `web/frontend/`                           |
| **bff**        | Node/Express GraphQL API (GraphQL Yoga + Pothos), Prisma ORM                                            | `web/bff/`                                |
| **db**         | Postgres — repos, users, reviews, PATs, the job queue (`pg-boss`)                                       | Railway-hosted, no local instance         |
| **hg hosting** | Mercurial repos served over HTTP (hgweb), plus a worker that provisions/deletes repos and lands reviews | `services/hg/`, runs on a DigitalOcean VM |
| **cli (`ch`)** | Deno CLI for the review workflow (submit/land/sync/status)                                              | `cli/` — see `cli/README.md`              |

`frontend` and `bff` live in one pnpm workspace (`web/`) and deploy as a
single Railway service — the BFF serves the frontend's built static assets
in prod, so there's one deployable unit per environment, not two.

## How each piece is set up: dev vs. prod

### Frontend

- **Dev**: `pnpm --filter @codehub/frontend dev` (or just `pnpm run dev` from
  `web/` — see Quick start below) runs Vite on `localhost:5173`, with
  `/graphql` and `/auth` proxied to the local BFF on `localhost:4000` (see
  `web/frontend/vite.config.js`). A `relay-compiler --watch` process runs
  alongside to keep generated GraphQL artifacts in sync. Vite serves the
  **raw source** `frontend/index.html` directly here — no build step; it
  finds it via its default `root` (wherever `vite` is invoked from, i.e.
  `web/frontend/`, since no `root` override exists in `vite.config.js`),
  and transforms/serves `index.html`'s `<script type="module"
  src="/src/main.tsx">` target on the fly as native ES modules (with HMR),
  rather than bundling anything upfront. `main.tsx` renders `router.tsx`'s
  route tree into the DOM — same entry component in dev and prod, only how
  it's *served* differs (see Prod, below).
- **Prod**: `tsc && relay-compiler && vite build` produces static assets in
  `frontend/dist/`, which the BFF serves directly (see `bff/src/index.ts`) —
  no separate frontend server or CDN. Prod never serves the raw source
  `frontend/index.html` — `vite build` processes that template (swapping the
  dev-mode `/src/main.tsx` script tag for the real hashed bundle references)
  into `frontend/dist/index.html`, and the BFF's wildcard route
  (`app.get('*any', ...)`) sends *that* built file for every unmatched path,
  as the SPA client-side-routing fallback.

### BFF

- **Dev**: `pnpm --filter @codehub/bff dev` runs `tsx watch src/index.ts` on `localhost:4000` (plus a `tsc --watch` typecheck process and `prisma studio`), reading config from `web/bff/.env` (copy from `.env.example`). There's no Dockerfile for local dev — it runs natively, same as any other Node process.
- **Prod**: deployed to Railway (`codehub-web` service) via Railpack
  (Nixpacks-style auto-detected build, not a Dockerfile — this was
  deliberately reverted from a containerized build; see git history if
  curious why). Build command `pnpm install && pnpm run build`; a
  pre-deploy step runs `pnpm --filter @codehub/bff run migrate:deploy`
  (`prisma migrate deploy`) before the new version starts.
- Two fully separate Railway **environments**, `production` and `test` —
  independent deployments, databases, and credentials, not a shared DB with
  an environment flag. Local dev always points at `test`, never `production`.

### Database

- Postgres, one instance per Railway environment (own volume, own
  credentials) — no local Postgres for dev.
- To get local dev credentials: `railway variables --kv --service codehub-web --environment test` (requires Railway project access). `DATABASE_URL` from that command uses Railway's private `*.railway.internal` hostname, which isn't reachable from a laptop — swap the host:port for the public tcp-proxy address instead, keeping the same credentials (see `web/bff/.env.example` for the exact shape). The same command also gives you `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` and `HG_INTERNAL_TOKEN` for the rest of `web/bff/.env`.
- Schema changes go through Prisma migrations (`web/bff/prisma/`) — full
  workflow:
  1. Edit `web/bff/prisma/schema.prisma`.
  2. `pnpm run db:migrate` (from `web/`) — generates and names a new
     `prisma/migrations/<timestamp>_<name>/` folder, and **applies it
     immediately** to whatever `DATABASE_URL` your `.env` points at. There's
     no personal/local DB — this is the same Railway `test` Postgres the
     `test` environment itself uses, so this step isn't an isolated trial
     run, it's a real, immediate change to shared team infrastructure. If
     `migrate dev` ever detects drift, it can offer to **reset** the
     database — think twice before confirming that prompt, since it'd wipe
     everyone's test data, not just yours.
  3. `pnpm run db:generate` (from `web/`) — **do this even though
     `db:migrate` already reran the Prisma/Pothos generators.** Those
     generators alone leave `bff/src/__generated__/pothos-prisma-types.ts`
     with an unfixed relative import
     (`clientOutput = "../../node_modules/@prisma/client"` in
     `schema.prisma`); `db:generate` additionally runs
     `bff/scripts/postgenerate.mjs`, which rewrites that import and adds
     the `@generated` header — a step Prisma's own generator trigger has
     no knowledge of and never runs on its own.
  4. Update resolvers (`web/bff/src/pothos/schema/*.ts`) to expose whatever
     changed; if the GraphQL schema itself changed, regenerate Relay
     artifacts (`pnpm --filter @codehub/frontend relay`, or automatic if
     `pnpm run dev`'s watcher is already running).
  5. Commit `schema.prisma`, the new migration folder, both regenerated
     `bff/src/__generated__/` files, and any touched frontend Relay
     artifacts together.
  6. Push to `main` — both `test` and `production` Railway environments
     track it and redeploy. Each runs `migrate:deploy` (`prisma migrate
     deploy`) as a pre-deploy step before the new code starts; for `test`
     this is usually a no-op (already applied in step 2, same DB), for
     `production` it's the first time the migration actually runs there.

### Mercurial hosting (hgweb + worker)

- All actual `hg` repo storage lives on a DigitalOcean VM, **not** on
  Railway and **not** on any developer's laptop — see `services/hg/README.md`
  for the full architecture (why, and how provisioning/deletion/landing work
  through a GraphQL job queue rather than SSH).
- The VM runs two independent Docker Compose stacks, `prod` and `test`, each
  with an `hgweb-app` (serves repos over HTTP), an `hgweb-proxy` (nginx,
  auth-gated via that stack's BFF), and a `worker` (polls its BFF for
  provision/delete/land jobs and executes them with real `hg` commands).
- **Dev** always points at the `test` stack — set `HG_WEB_BASE` (in
  `web/bff/.env`) and `VITE_HG_HOST` (in `web/frontend/.env.local`) to the
  test stack's `hgweb-proxy` address (currently the VM's IP on port `8001`;
  see the `.env.example` files for both).
- **Prod** deploys via `services/hg/deploy.sh prod` (and `deploy.sh test`
  separately for the test stack) — deploy and verify `test` first, then
  `prod`.

### CLI (`ch`)

- Not deployed anywhere (yet) — it's a local tool developers/reviewers run against
  whichever server they've logged into (`ch login <server-url>`), same
  binary for talking to `test` or `production`.
- See `cli/README.md` for building, installing onto your `PATH`, and
  available commands.

## Quick start (new laptop)

Prerequisites: Node (see `web/package.json`'s `packageManager` for the pnpm
version — currently pnpm 11.x via corepack), [Deno](https://deno.com),
[Mercurial](https://www.mercurial-scm.org/), and Railway project access.

1. `cd web && pnpm install` — installs the `frontend`+`bff` workspace
   (`postinstall` also runs `prisma generate`).
2. `cp web/bff/.env.example web/bff/.env` and fill in real values — see
   "Database" above for how to fetch them via `railway variables`.
3. `cp web/frontend/.env.example web/frontend/.env.local` and set
   `VITE_HG_HOST` — see "Mercurial hosting" above.
4. From `web/`, run `pnpm run dev` — starts the BFF, frontend, and Relay
   watcher together (waits for the BFF to be listening before starting
   Vite, so you won't see a burst of proxy `ECONNREFUSED` errors at
   startup).
5. Build and install the `ch` CLI — see `cli/README.md`.
6. `ch login http://localhost:4000` (create a PAT first at
   `http://localhost:4000/settings/tokens`).

## Operational gotchas (learned the hard way)

A few non-obvious things about this stack that caused real bugs/outages
before being understood — worth knowing before touching the VM, `deploy.sh`,
or Repository-related GraphQL resolvers.

- **`docker compose up -d --build` recreating one service but not its
  dependent silently breaks routing.** nginx resolves an upstream hostname
  (e.g. `hgweb-app`) to an IP once and caches it — it does not re-resolve on
  its own. If a deploy recreates `hgweb-app` (new container, new IP on the
  Docker network) without also recreating `hgweb-proxy`, the proxy keeps
  sending requests to the old, now-dead IP — every request 502/500s even
  though `docker ps` shows everything healthy. Symptom looked like "repo
  metadata loads but all repo content is empty." Fix in the moment:
  `docker restart <stack>-hgweb-proxy-1`. Structural fix: `deploy.sh` now
  rsyncs to a stack-specific directory (`/opt/codehub-hg-<stack>/`), which
  changes the bind-mount source path and makes Compose recreate *all three*
  containers together on every deploy, not just the ones it thinks changed.

- **`deploy.sh` takes an explicit `<prod|test>` argument and never deploys
  both at once, on purpose** — not just for container-level isolation, but
  because config files (`hgweb.ini`, `hg_hooks.py`, nginx confs) are
  bind-mounted into *already-running* containers and take effect live,
  without a restart. A shared rsync target between the two stacks would let
  a `test`-only deploy silently change prod's behavior before prod was ever
  explicitly deployed — so each stack gets its own directory on the VM
  (`/opt/codehub-hg-prod/`, `/opt/codehub-hg-test/`), fully isolating one
  stack's files from the other's running containers.

- **A key repeated in a `.env` file silently uses the *last* occurrence**,
  not the first, and `dotenv` won't warn you. A stale duplicate block left
  over from an earlier local-hgweb setup quietly overrode a correct
  `HG_WEB_BASE` with `http://localhost:8000` further down the same file —
  the fetch calls failed with `ECONNREFUSED` in a way that looked like a
  code bug. If an env var seems to have the "wrong" value despite the top
  of the file looking right, grep the whole file for that key.

- **Two different `${...}` substitution mechanisms exist around
  `vm/nginx-test.conf.template`, and they're easy to conflate.** Docker
  Compose interpolates `${BFF_TEST_DOMAIN}` in `docker-compose.test.yml`
  itself, client-side, before the container exists (from `.env.test`).
  Separately, the `nginx:alpine` image's entrypoint runs `envsubst` over
  `*.template` files *inside* the container at startup, substituting only
  variable names that exist in that container's own environment — which is
  why nginx's own built-in variables (`$host`, `$request_uri`, ...) pass
  through untouched even though the file goes through `envsubst`: they were
  never set as container env vars, so they're not in `envsubst`'s
  substitution list.

- **Mercurial's `[auth]` config only applies a section when its username
  matches the destination URL's own embedded username, if the URL has
  one.** A repo cloned via `hg clone http://x:<token>@host/...` persists
  `x` into `.hg/hgrc`'s `paths.default` (Mercurial strips the password on
  save but keeps the username) — if `ch`'s own push-auth config then
  assumes a different, hardcoded username, Mercurial silently discards the
  whole `[auth]` section rather than erroring, surfacing as `http
  authorization required` with no credentials even attempted. `ch` (and the
  Clone dropdown) now keep a fixed placeholder username in sync between
  both sides instead of assuming one — see `code_review_design.md`'s "A
  clone/auth subtlety."

- **Every new GraphQL field that returns a `Repository` (or anything nested
  under one) needs its own access check — nothing enforces this
  automatically.** `repository_by_owner_and_name` had a `canAccessRepo`
  check; `repository(id:)` didn't, and leaked private repos' name/
  description/visibility to unauthenticated callers (nested content fields
  like `directory`/`commits` were independently protected, so no file/commit
  content leaked — just metadata). When adding a new top-level query that
  can resolve to a `Repository`, deliberately copy the existing
  `canAccessRepo`/`requireRepoReadAccess` pattern rather than assuming
  Prisma/Pothos enforces visibility for you.

## Further reading

- `services/hg/README.md` — Mercurial hosting architecture, the review
  protocol (`Review-Id` trailers, `reviews/<node>` bookmarks, why `master`
  can only move via landing), and the VM deploy process.
- `cli/README.md` — building, installing, and using `ch`.
