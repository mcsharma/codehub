# Code review ("Diffs") for CodeHub

This branch adds Phabricator/Gerrit-style code review on top of CodeHub's
Mercurial hosting: a `ch` CLI for submitting stacked commits, a review
GraphQL API, an async landing worker, and a minimal review UI. This doc
summarizes what was built and how to run/test it locally.

## Design in one paragraph

A review pins a real hg changeset hash (`headNode`/`baseNode`) — it is
never a stored patch snapshot; diffs are always fetched live from hgweb by
node, the same code path the Code tab already uses. `ch submit` pushes
each commit in your draft stack under an ephemeral, hash-scoped bookmark
(`reviews/<12-hex-node>`, never reused or force-moved) and stamps a
`Review-Id: D<number>` trailer into the commit description so re-submits
after an amend correlate back to the same review. Mainline is a `master`
bookmark that only ever moves through the server-side landing worker — a
`prepushkey` hook unconditionally rejects any push that tries to move
`master` or use a bookmark name that isn't `reviews/<12-hex>`, so there is
no legitimate push path to bypass. Landing is async (job queue + worker,
not a synchronous call in a resolver). Stacks are just chained reviews
(`D(n+1).baseNode == D(n).headNode`); the `evolve` hg extension powers
client-side restacking after amends and after a lower commit lands.

## What was built, by layer

**`services/hg/`** — server-side hg config
- `hg_hooks.py`: `prepushkey` hook rejecting any bookmark push except
  `reviews/<12-hex-node>`; `master` can never be pushed to directly.
- `hgweb.ini`: `[phases] publish = False` so pushed changesets stay
  `draft` (amendable) instead of being marked `public` on arrival.
- `land-review.sh`: forced-command SSH target (its own dedicated key,
  `HG_VM_LAND_KEY`, isolated from the create/delete keys) — fast-forwards
  or grafts a review's head onto `master`, marks it public, prints the
  landed node hash to stdout.
- `web/docker-compose.yml`'s `hgweb-app`/`hgweb-proxy` mirror this
  config locally (bind-mounted, unmodified) behind the same
  `auth_request` permission check the BFF enforces in prod.

**`web/bff/`** — data model, GraphQL API, landing worker
- Prisma models `Review` / `ReviewVersion` (+ `ReviewStatus` enum:
  `OPEN → LANDING → LANDED` or `LAND_FAILED`, plus `ABANDONED`) and
  `Repository.nextReviewNumber` for atomic per-repo `D<number>`
  allocation. Migration: `prisma/migrations/20260729022348_add_reviews/`.
- `src/pothos/schema/review.ts`: `Review`/`ReviewVersion` GraphQL types,
  `Repository.review(number)` field, and CLI-facing mutations —
  `create_review`, `add_review_version`, `land_review`, `abandon_review`.
- PAT bearer auth added to the Yoga context in `src/index.ts` (existing
  `resolvePersonalAccessToken`, so `Authorization: Bearer <token>` works
  alongside the existing session-cookie auth) — this is what lets `ch`
  talk to `/graphql` without a browser session.
- `src/jobs/boss.ts` + `src/jobs/land-review.ts`: a pg-boss (Postgres-
  backed, in-process) worker, concurrency 1. Branches on
  `HG_LOCAL_REPOS_DIR` between `src/repos/land-local.ts` (direct `hg`
  calls, local dev) and `src/repos/land-on-vm.ts` (SSH forced command,
  prod), mirroring the existing provision/delete local-vs-VM split.

**`cli/`** — `ch`, a standalone Deno/TypeScript CLI (not an npm package)
- `ch login <server-url> [token]` — saves `{server, token}` to
  `~/.config/codehub/config.json`, chmod 600.
- `ch submit` — stack-aware: walks your draft stack bottom-to-top,
  creates a `Review` + stamps a `Review-Id:` trailer (via
  `hg metaedit` + `hg evolve --any --all` to restack) for any commit that
  doesn't have one yet, then pushes each commit under its
  `reviews/<node12>` bookmark and records the version via
  `add_review_version`. Idempotent — re-running after an amend only
  pushes/records what actually changed. Prints a `/d/<number>` URL per
  review.
- `ch land [D<number>]` — calls `land_review`, polls until
  `LANDED`/`LAND_FAILED`.
- `ch sync` — pulls, prunes locally any commit whose review has landed
  (`hg prune -s <landed_node>`), restacks the remainder with
  `hg evolve --any --all`.
- `ch status` — local stack with each commit's review number/status.
- `deno task compile` → standalone binary at `cli/dist/ch`.

**`web/frontend/`** — minimal UI
- `src/pages/RepoReviewsPage.tsx` (`/:owner/:repo/reviews`) — flat list
  of a repo's reviews with number/title/status/author.
- `src/pages/ReviewPage.tsx` (`/:owner/:repo/d/:number`) — metadata card
  (status badge, author, date, version picker) + file tree + diff view,
  built the same way `CommitPage.tsx` is (`DiffView` from
  `@git-diff-view/react`, `parseUnifiedDiff`, `CommitFileTree`,
  `CollapsibleSidebarPane`).
- `RepoHeader.tsx` gained a "Reviews" tab next to Code/Commits/Settings.

## Onboarding: running and testing this locally

### 1. Prerequisites

- Mercurial with the **evolve** extension (powers `metaedit`, restacking,
  `prune` — required, `ch` checks for it and errors clearly if missing):
  ```bash
  python3 -m pip install --user --break-system-packages hg-evolve
  ```
  Then add to `~/.hgrc`:
  ```ini
  [extensions]
  evolve = <path from `python3 -m pip show -f hg-evolve`>/hgext3rd/evolve
  ```
- [Deno](https://deno.com) (for `ch`) and Docker (for the local hg stack)
  — everything else follows the repo's existing `pnpm`/Postgres setup.

### 2. Start the stack

```bash
docker compose -f web/docker-compose.yml up -d db hgweb-app hgweb-proxy
cd web && pnpm install && pnpm run db:migrate && pnpm dev
```
`pnpm dev` runs the BFF (port 4000), frontend (port 5173, proxies
`/graphql` to the BFF), and the Relay compiler in watch mode. Confirm
`web/bff/.env` has `HG_WEB_BASE=http://localhost:8000` and
`HG_LOCAL_REPOS_DIR=../../services/hg/local-data/repos` set (see
`.env.example`) — this is what routes repo creation/landing at the local
hgweb instead of prod's VM over SSH.

### 3. Build and install `ch`

```bash
cd cli
deno task compile          # → cli/dist/ch
ln -sf "$(pwd)/dist/ch" ~/.local/bin/ch   # make sure ~/.local/bin is on PATH
```

### 4. Create a repo, a token, and log in

1. In the browser (`http://localhost:5173`), sign in, create a repo, and
   create a personal access token at `/settings/tokens`.
2. `ch login http://localhost:4000 <token>`

### 5. Exercise the flow

```bash
hg clone http://localhost:8000/<owner>/<repo> ~/wherever
cd ~/wherever
echo hi >> file && hg commit -m "First review"
ch submit                       # prints a D<N> URL
```
Open the printed URL — confirm the metadata card and diff render, and
that the repo's "Reviews" tab lists it.

**Amend/version test:**
```bash
hg amend -m "First review, take 2"   # or edit + hg amend
ch submit                            # same D<N>, new version
```
Confirm the review page's version picker now shows v1/v2.

**Stacked diff test:** make a second commit on top, `ch submit` again —
expect a second `D<N+1>` whose `base_node` is the first review's
`head_node`.

**Landing test:**
```bash
ch land D<N>          # or just `ch land` from the commit's checkout
ch status             # confirm LANDED
```
Then in a fresh `hg clone` of the same repo, confirm the `master`
bookmark is at the landed node and `hg log -r master --template
'{phase}\n'` prints `public`.

**Sync test (after landing the bottom of a stack):**
```bash
ch sync                # prunes the landed commit locally, restacks the rest
ch land D<N+1>         # lands cleanly on the new master
```

**Hook rejection test (should fail):**
```bash
hg push -B master
hg bookmark not-a-review-bookmark && hg push -B not-a-review-bookmark
```
Both should be rejected server-side by `hg_hooks.py`.

### 6. Typecheck everything

```bash
cd web && pnpm typecheck        # bff + frontend
cd cli && deno check src/main.ts
```

## Known gaps (explicit follow-ups, not bugs)

No comments/approve flow (anyone with write access can land in v1); no
brew-tap distribution for `ch` (compiled binary only); no changegroup-level
hook forcing every pushed head under a `reviews/*` bookmark (a bare
fast-forward push can still deposit draft changesets server-side —
harmless, since `master` only moves via landing); no server-side GC of
stale `reviews/*` bookmarks.
