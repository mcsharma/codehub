# Scaffold

A starter scaffold: pnpm monorepo, Express + GraphQL Yoga + Pothos + Prisma
backend, React + Relay + React Router + Tailwind v4 frontend, Google OAuth
login. The domain model is a minimal bookstore (books/authors/publishers,
plus a favorites feature) purely as a working example — swap it out for
whatever your actual project needs; the surrounding plumbing (auth, GraphQL
schema conventions, Relay routing pattern, design system) is what's meant
to be reused as-is.

## Components

| Component    | What it is                                                    | Where            |
| ------------ | -------------------------------------------------------------- | ---------------- |
| **frontend** | React + Vite single-page app                                   | `web/frontend/`  |
| **bff**      | Node/Express GraphQL API (GraphQL Yoga + Pothos), Prisma ORM   | `web/bff/`       |
| **db**       | Postgres — users, sessions, PATs, books/authors/publishers      | any Postgres instance |

`frontend` and `bff` live in one pnpm workspace (`web/`) and deploy as a
single service — the BFF serves the frontend's built static assets in
prod, so there's one deployable unit, not two.

`services/` is reserved for future standalone backend services (VM-hosted
infra, workers, etc.) — empty in this scaffold.

## How each piece is set up: dev vs. prod

### Frontend

- **Dev**: `pnpm --filter @scaffold/frontend dev` (or `pnpm run dev` from
  `web/` — see Quick start below) runs Vite on `localhost:5173`, with
  `/graphql` and `/auth` proxied to the local BFF on `localhost:4000` (see
  `web/frontend/vite.config.js`). A `relay-compiler --watch` process runs
  alongside to keep generated GraphQL artifacts in sync.
- **Prod**: `tsc && relay-compiler && vite build` produces static assets in
  `frontend/dist/`, which the BFF serves directly (see `bff/src/index.ts`)
  via `express.static` plus a wildcard SPA-fallback route — no separate
  frontend server or CDN needed.

### BFF

- **Dev**: `pnpm --filter @scaffold/bff dev` runs `tsx watch src/index.ts`
  on `localhost:4000` (plus a `tsc --watch` typecheck process and `prisma
  studio`), reading config from `web/bff/.env` (copy from `.env.example`).
  No Dockerfile for local dev — it runs natively, same as any other Node
  process.
- **Prod**: however you deploy Node apps — `pnpm install && pnpm run
  build`, then `node dist/index.js`. Run `pnpm --filter @scaffold/bff run
  migrate:deploy` (`prisma migrate deploy`) before starting the new
  version.

### Database

- `docker compose up -d` (from the repo root) starts a local Postgres
  matching `web/bff/.env.example`'s default `DATABASE_URL` exactly — no
  editing needed. See `docker-compose.yml`; data persists in a named volume
  across `down`/`up` cycles (`docker compose down -v` to wipe it). Any other
  Postgres instance works too (a local install, a hosted free tier) — just
  point `DATABASE_URL` at it instead.
- Schema changes go through Prisma migrations (`web/bff/prisma/`) — full
  workflow:
  1. Edit `web/bff/prisma/schema.prisma`.
  2. `pnpm run db:migrate` (from `web/`) — generates and names a new
     `prisma/migrations/<timestamp>_<name>/` folder, and applies it
     immediately to whatever `DATABASE_URL` your `.env` points at.
  3. `pnpm run db:generate` (from `web/`) — **do this even though
     `db:migrate` already reran the Prisma/Pothos generators.** Those
     generators alone leave `bff/src/__generated__/pothos-prisma-types.ts`
     with an unfixed relative import (`clientOutput =
     "../../node_modules/@prisma/client"` in `schema.prisma`);
     `db:generate` additionally runs `bff/scripts/postgenerate.mjs`, which
     rewrites that import and adds the `@generated` header — a step
     Prisma's own generator trigger has no knowledge of and never runs on
     its own.
  4. Update resolvers (`web/bff/src/pothos/schema/*.ts`) to expose
     whatever changed; if the GraphQL schema itself changed, regenerate
     Relay artifacts (`pnpm --filter @scaffold/frontend relay`, or
     automatic if `pnpm run dev`'s watcher is already running).
  5. Commit `schema.prisma`, the new migration folder, both regenerated
     `bff/src/__generated__/` files, and any touched frontend Relay
     artifacts together.

### Auth

Google OAuth (`web/bff/src/auth/google.ts`) needs your own credentials —
create an OAuth client at Google Cloud Console > Google Auth Platform >
Clients, and set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/
`GOOGLE_REDIRECT_URI` in `web/bff/.env`. Nothing about login works until
these are real. Session cookies and Personal Access Tokens (see
`TokensPage.tsx`, `/settings/tokens`) work out of the box once you have at
least one user in the database (e.g. via `prisma/seed.ts`).

## Quick start (new laptop)

Prerequisites: Node (see `web/package.json`'s `packageManager` for the pnpm
version — currently pnpm 11.x via corepack) and Docker (or any Postgres
instance).

1. `docker compose up -d` (repo root) — starts local Postgres.
2. `cp web/bff/.env.example web/bff/.env` — the default `DATABASE_URL`
   already matches step 1's Postgres, so no editing needed there; add
   Google OAuth credentials if you want login to work. Do this **before**
   installing — `pnpm install`'s `postinstall` hook runs `prisma generate`
   immediately, and `prisma.config.ts` needs `DATABASE_URL` resolvable at
   that point, so `.env` has to exist first or install itself fails with
   `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`.
3. `cd web && pnpm install` — installs the `frontend`+`bff` workspace.
4. `pnpm run db:migrate` then `pnpm run db:generate` (from `web/`).
5. `cd bff && pnpm run seed` — loads the sample bookstore fixtures.
6. From `web/`, run `pnpm run dev` — starts the BFF, frontend, and Relay
   watcher together (waits for the BFF to be listening before starting
   Vite).

## Further reading

- `web/bff/prisma/schema.prisma` — the full data model.
- `web/bff/src/pothos/schema/book.ts` — the most illustrative GraphQL
  schema file: a paginated connection, a plain list, a many-to-many via an
  implicit relation (`Book.authors`), a many-to-many via an explicit join
  model with its own data (`Favorite`), and an auth-gated mutation.
- `web/frontend/src/router.tsx` — the loader + `React.lazy` +
  `usePreloadedQuery` routing pattern every page follows.
