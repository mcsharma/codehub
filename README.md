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
  alongside to keep generated GraphQL artifacts in sync.
- **Prod**: `tsc && relay-compiler && vite build` produces static assets in
  `frontend/dist/`, which the BFF serves directly (see `bff/src/index.ts`) —
  no separate frontend server or CDN.

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
- Schema changes go through Prisma migrations (`web/bff/prisma/`); `pnpm db:migrate` for a new migration locally, `migrate:deploy` (automatic via Railway's pre-deploy step) to apply them in an environment.

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

## Further reading

- `services/hg/README.md` — Mercurial hosting architecture, the review
  protocol (`Review-Id` trailers, `reviews/<node>` bookmarks, why `master`
  can only move via landing), and the VM deploy process.
- `cli/README.md` — building, installing, and using `ch`.
