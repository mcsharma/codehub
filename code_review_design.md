# Code review ("Diffs") for CodeHub

This doc covers the Phabricator/Gerrit-style code review feature on top of
CodeHub's Mercurial hosting: a `ch` CLI for submitting stacked commits, a
review GraphQL API, an async landing/provisioning worker running on the same
VM as the repos, and a minimal review UI. It summarizes the design and how
to run/test it locally — see `README.md` (repo root) for general dev setup
and `services/hg/README.md` for the full Mercurial-hosting architecture.

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
no legitimate push path to bypass. Landing (and repo provisioning/deletion)
is async — a GraphQL job queue plus a worker process on the hg VM, not a
synchronous call in a resolver, and not SSH. Stacks are just chained reviews
(`D(n+1).baseNode == D(n).headNode`); the `evolve` hg extension powers
client-side restacking after amends and after a lower commit lands.

## Why there's no SSH anywhere in this design

Three operations need more than hgweb's HTTP API exposes (`hg init`,
`phase --public`, moving the `master` bookmark aren't reachable over HTTP):
provisioning a repo, deleting one, and landing a review. Earlier iterations
of this did those over SSH — a set of forced-command scripts on the VM, one
per operation, each with its own restricted key. That meant local dev could
never exercise the same path production used (local dev shelled out to `hg`
directly against a bind-mounted directory instead), so a bug in the SSH
transport or the server-side scripts only ever surfaced in prod.

The current design instead runs a small worker **on the VM itself**
(`services/hg/worker/`) that polls the BFF over GraphQL — the same
PAT-bearer-over-HTTP mechanism `ch` already uses — for pending jobs, and
executes them with real `hg`/filesystem calls against the repo it's
colocated with. Postgres stays fully private to Railway; the VM never talks
to it directly, and there's no bespoke RPC surface to secure — just the
same GraphQL endpoint everything else uses, gated by a dedicated
service-account PAT (`codehub-hg-worker`, seeded via
`web/bff/scripts/seed-hg-worker.mjs`) instead of a human user's token. Local
dev now exercises the exact same job-queue-and-worker path as prod, just
against the `test` VM stack instead of `production` — no separate
local-only code path to drift out of sync.

## What was built, by layer

**`services/hg/`** — hg config and the VM-side worker
- `hg_hooks.py`: `prepushkey` hook rejecting any bookmark push except
  `reviews/<12-hex-node>`; `master` can never be pushed to directly.
- `hgweb.ini`: `[phases] publish = False` so pushed changesets stay
  `draft` (amendable) instead of being marked `public` on arrival.
- `worker/src/ops.ts`: `provisionRepo`, `deleteRepo`, `landReview` — real
  `hg`/filesystem operations, re-validating owner/repo/node independently
  of the BFF's own validation (this is the thing actually touching disk).
  `provisionRepo` also seeds every new repo with a public "Initial commit"
  (see "A provisioning subtlety" below).
- `worker/src/main.ts`: poll loop — `claim_hg_job` → dispatch to `ops.ts` →
  `complete_hg_job`/`fail_hg_job`, against the BFF for whichever stack
  (`prod`/`test`) this worker instance belongs to.
- `vm/docker-compose.{prod,test}.yml`: two independent stacks on one
  DigitalOcean VM, each with `hgweb-app` (hgweb over HTTP),
  `hgweb-proxy` (nginx, `auth_request`-gated via that stack's BFF), and
  `worker`. `deploy.sh` rsyncs this directory to the VM and brings both
  stacks up together — there's no way to redeploy just one.

**`web/bff/`** — data model, GraphQL API, job queue
- Prisma models `Review` / `ReviewVersion` (+ `ReviewStatus` enum:
  `OPEN → LANDING → LANDED` or `LAND_FAILED`, plus `ABANDONED`) and
  `Repository.nextReviewNumber` for atomic per-repo `D<number>`
  allocation.
- `src/pothos/schema/review.ts`: `Review`/`ReviewVersion` GraphQL types,
  `Repository.review(number)` field, and CLI-facing mutations —
  `create_review`, `add_review_version`, `land_review`, `abandon_review`.
- `src/pothos/schema/hg-worker.ts`: `claim_hg_job`, `complete_hg_job`,
  `fail_hg_job` — thin wrappers around pg-boss (`src/jobs/boss.ts`),
  gated by `requireHgWorker()` so only the `codehub-hg-worker`
  service-account PAT can call them, never a normal user's token.
- `src/jobs/`: `queues.ts` (the three queue names), `provision-repo.ts` /
  `delete-repo.ts` / `land-review.ts` (`enqueue*` helpers that send a job
  and poll for its completion — `wait-for-job.ts` — so `create_repository`
  etc. still feel synchronous to the caller even though nothing executes
  in-process). Nothing under `src/repos/` runs `hg` directly anymore —
  `hgweb-client.ts` is read-only (browsing commits/diffs/bookmarks via
  hgweb's JSON API); all writes go through the job queue to the VM worker.
- PAT bearer auth in the Yoga context (`src/index.ts`, `Authorization:
  Bearer <token>`) is what lets both `ch` and the VM worker talk to
  `/graphql` without a browser session.

**`cli/`** — `ch`, a standalone Deno/TypeScript CLI (not an npm package,
see `cli/README.md` for build/install)
- `ch login <server-url> [token]` — saves `{server, token}` to
  `~/.config/codehub/config.json`, chmod 600.
- `ch submit` — stack-aware: walks your draft stack bottom-to-top,
  creates a `Review` + stamps a `Review-Id:` trailer (via
  `hg metaedit` + `hg evolve --any --all` to restack) for any commit that
  doesn't have one yet, then pushes each commit under its
  `reviews/<node12>` bookmark and records the version via
  `add_review_version`. Idempotent — re-running after an amend only
  pushes/records what actually changed. Prints a `/d/<number>` URL per
  review. Its push auth (`hgNetwork()` in `src/hg.ts`) matches whatever
  username the repo's `default` path already has (falling back to a fixed
  placeholder if none) — see "A clone/auth subtlety" below for why that
  matters.
- `ch land [D<number>]` — calls `land_review`, polls until
  `LANDED`/`LAND_FAILED`.
- `ch sync` — pulls, prunes locally any commit whose review has landed
  (`hg prune -s <landed_node>`), restacks the remainder with
  `hg evolve --any --all`.
- `ch status` — local stack with each commit's review number/status.

**`web/frontend/`** — minimal UI
- `src/pages/RepoReviewsPage.tsx` (`/:owner/:repo/reviews`) — flat list
  of a repo's reviews with number/title/status/author.
- `src/pages/ReviewPage.tsx` (`/:owner/:repo/d/:number`) — metadata card
  (status badge, author, date, version picker) + file tree + diff view,
  built the same way `CommitPage.tsx` is (`DiffView` from
  `@git-diff-view/react`, `parseUnifiedDiff`, `CommitFileTree`,
  `CollapsibleSidebarPane`).
- `RepoHeader.tsx` gained a "Reviews" tab next to Code/Commits/Settings.
- `CloneButton.tsx` embeds a fixed placeholder username (`codehub@`) in
  the suggested `hg clone` command — see "A clone/auth subtlety" below.

## A provisioning subtlety: why every repo gets a seed commit

`ch submit`'s first pass metaedits every *draft* commit in your stack to
add a `Review-Id` trailer. Metaediting a commit that has no parent doesn't
produce a descendant — it produces a brand-new, unrelated root, which a
non-empty remote refuses to accept (`abort: repository is unrelated`).
That's harmless for any commit *after* the first, since its parent hash is
unchanged by the rewrite and ancestry stays intact — but a brand-new repo's
very first commit has no parent, so if a user pushes it with a raw
`hg push` (natural first move, and one this design deliberately still
allows — see below) before ever running `ch submit`, submitting anything
built on top of it later hits exactly this failure.

Fixed by having `provisionRepo` (`services/hg/worker/src/ops.ts`) seed
every new repo with an empty, **public** "Initial commit" at creation time.
Public, specifically, so it's excluded from `ch submit`'s `draft() and
ancestors(.)` stack revset and is never itself a candidate for rewriting.
This means a user's own first commit always has a real parent, so amending
it later stays connected to what the remote already has — without having
to forbid raw `hg push` for anyone.

## A clone/auth subtlety: why the Clone button embeds a username

Mercurial's `[auth]` config matching (`hg help config.auth`) only applies a
section to a destination URL when — if that URL already has an embedded
username — the section's username matches it too. `ch submit`'s push auth
(`hgNetwork()` in `cli/src/hg.ts`) used to hardcode a username that had no
particular reason to match what ended up in a given clone's `.hg/hgrc`
`paths.default` (Mercurial persists the username from however a repo was
cloned, but always strips the password before writing to disk). A mismatch
there means Mercurial silently discards the whole `[auth]` section and
falls back to no credentials at all, surfacing as `http authorization
required` with nothing obviously wrong. Fixed two ways together: `ch`
now reads whichever username the repo's own `default` path actually has
(falling back to a placeholder only if there's none at all) instead of
assuming a fixed value, and the Clone dropdown's suggested command embeds
that same placeholder (`http://codehub@<host>/<owner>/<repo>`) so a fresh
clone and `ch submit` always agree. The username itself is never checked
server-side (`/internal/auth-check` only looks at whatever follows the
first colon — the password/token) — only Mercurial's own client-side
matching cares that the two sides agree with each other.

## Onboarding: running and testing this locally

See `README.md` (repo root) for full local dev setup — installing
dependencies, getting `web/bff/.env`/`web/frontend/.env.local` populated
against the shared `test` Railway environment and VM stack, and building
`ch` (`cli/README.md`). The steps below assume that's already done.

### Exercise the flow

```bash
ch login http://localhost:4000        # if not already logged in
hg clone http://codehub@<test-vm-host>:8001/<owner>/<repo> ~/wherever
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

### Typecheck everything

```bash
cd web && pnpm typecheck        # bff + frontend
cd cli && deno check src/main.ts
cd services/hg/worker && npm run typecheck
```

## Known gaps (explicit follow-ups, not bugs)

No comments/approve flow (anyone with write access can land in v1); no
brew-tap distribution for `ch` (compiled binary, manually symlinked onto
`PATH` — see `cli/README.md`); no changegroup-level hook forcing every
pushed head under a `reviews/*` bookmark (a bare fast-forward push can
still deposit draft changesets server-side — harmless, since `master` only
moves via landing, and this is now load-bearing rather than incidental —
see "A provisioning subtlety" above); no server-side GC of stale
`reviews/*` bookmarks; `deploy.sh` always redeploys both the `prod` and
`test` VM stacks together, with no way to target just one.
