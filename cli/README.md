# `ch` — CodeHub code review CLI

A Deno-based command-line tool for CodeHub's code-review workflow (submit a
commit stack for review, land a review onto `master`, sync/restack after
landings), for both Mercurial and git repos. `ch` detects which VCS the
current repo uses (`hg root` vs. `sl root`) and dispatches accordingly — see
`src/vcs.ts`.

For **hg repos**, see `services/hg/README.md` for how the review protocol
(`Review-Id` trailers, `reviews/<node>` bookmarks, the `master` bookmark)
works on the server side.

For **git repos**, commits are made with [Sapling](https://sapling-scm.com/)
(`sl`) rather than plain `git` — `ch submit` relies on Sapling's automatic
restacking after amending a commit, which plain git doesn't do on its own.
`ch submit` pushes to `refs/reviews/<sha>` exactly like a manual `git push`
would; a server-side `post-receive` hook does the actual review-creation
work and is what `ch` gets its review numbers from (see
`services/git/hooks/post-receive`, `web/bff/src/pothos/schema/
git-review.ts`) — `ch` has no direct GraphQL review-mutation calls on the
git path, unlike the hg path.

## Prerequisites

**For hg repos:**
- [Mercurial](https://www.mercurial-scm.org/) (`hg`) on your `PATH`
- The [`evolve`](https://www.mercurial-scm.org/doc/evolution/) extension
  enabled in your `~/.hgrc` — `ch submit` uses it to restack the rest of
  your stack after tagging a commit with its `Review-Id`:
  ```ini
  [extensions]
  evolve =
  ```

**For git repos:**
- [Sapling](https://sapling-scm.com/) (`sl`) and `git` both on your `PATH`.

**Either way:**
- [Deno](https://deno.com) (developed against 2.x)

## Build

From this directory:

```sh
deno task compile
```

This produces a self-contained binary at `dist/ch`. Re-run it any time you
change something under `src/` — there's no separate install step, just a
rebuild (see below for why that's enough).

## Install onto your `PATH`

Symlink the compiled binary somewhere on your `PATH`, e.g.:

```sh
mkdir -p ~/.local/bin
ln -sf "$(pwd)/dist/ch" ~/.local/bin/ch
```

(Make sure `~/.local/bin` is actually on your `PATH` — add
`export PATH="$HOME/.local/bin:$PATH"` to your shell profile if not.)

Because this is a symlink to `dist/ch` rather than a copy, running
`deno task compile` again after pulling new CLI changes is all you need —
the `ch` command on your `PATH` picks up the rebuilt binary automatically.

## Log in

Create a personal access token at `<server>/settings/tokens` (e.g.
`http://localhost:4000/settings/tokens` for local dev against the `test`
BFF), then:

```sh
ch login <server-url> [token]
```

This writes `~/.config/codehub/config.json` (`{ server, token }`, mode
`0600`). The token argument is optional — omit it and `ch` will prompt.

## Commands

```
ch login <server-url>   Save a personal access token for a CodeHub server
ch submit                Submit the current draft commit stack for review
ch land [D<number>]      Land a review onto master (defaults to the current commit's review)
ch sync                  Pull, drop locally-landed commits, restack the remainder
ch status                Show the local stack and each commit's review status
```

Run any of these from inside a clone of a CodeHub repo (`ch` derives
owner/repo from `hg paths default` or `sl paths default` depending on which
VCS the repo uses, not from any config).

## Developing the CLI itself

`deno task dev` runs `src/main.ts` directly (no compile step) — useful while
iterating on CLI code. `deno task check` type-checks without running
anything.
