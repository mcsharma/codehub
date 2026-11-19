#!/bin/sh
# One-off cleanup after code review was removed: for every hg repo in one
# stack, deletes the leftover `reviews/<node>` bookmarks and strips the
# changesets that never landed (draft and not an ancestor of `master`; every
# draft changeset if the repo has no `master` yet). Dry run by default.
#
# Usage (from your machine):  ./cleanup-reviews.sh <prod|test> [--apply]
#
# It pipes itself over ssh into that stack's worker container and re-runs
# there with `--local /data/repos`, so it's POSIX sh (the container is
# alpine). `hg strip` saves a backup bundle in each repo's
# .hg/strip-backup/, so an applied strip can still be undone with
# `hg unbundle` until those bundles are deleted.
set -eu

if [ "${1:-}" = "--local" ]; then
  REPOS_DIR="$2"
  APPLY=false
  [ "${3:-}" = "--apply" ] && APPLY=true

  for repo in "$REPOS_DIR"/*/*; do
    [ -d "$repo/.hg" ] || continue
    name="${repo#"$REPOS_DIR"/}"

    if hg -R "$repo" log -r 'bookmark(master)' -T x >/dev/null 2>&1; then
      revset='draft() and not ::bookmark(master)'
    else
      revset='draft()'
    fi
    bookmarks="$(hg -R "$repo" bookmarks -T '{bookmark}\n' | grep '^reviews/' || true)"
    changesets="$(hg -R "$repo" log -r "$revset" -T '{node|short} {desc|firstline}\n')"

    [ -z "$bookmarks" ] && [ -z "$changesets" ] && continue

    echo "== $name"
    if [ -n "$bookmarks" ]; then
      echo "  bookmarks to delete: $(echo "$bookmarks" | wc -l | tr -d ' ')"
    fi
    if [ -n "$changesets" ]; then
      echo "  changesets to strip:"
      echo "$changesets" | sed 's/^/    /'
    fi

    if $APPLY; then
      if [ -n "$bookmarks" ]; then
        # shellcheck disable=SC2086 # intentional word-splitting: one bookmark per word
        hg -R "$repo" bookmarks -d $bookmarks
      fi
      if [ -n "$changesets" ]; then
        hg -R "$repo" --config extensions.strip= strip -r "$revset"
      fi
    fi
  done

  $APPLY || echo "(dry run: nothing changed; re-run with --apply)"
  exit 0
fi

STACK="${1:-}"
case "$STACK" in
  prod|test) ;;
  *) echo "Usage: $0 <prod|test> [--apply]" >&2; exit 1 ;;
esac
APPLY_FLAG=""
[ "${2:-}" = "--apply" ] && APPLY_FLAG="--apply"

HOST="root@143.110.207.184"
REMOTE_DIR="/opt/codehub-hg-$STACK"
ssh "$HOST" "cd $REMOTE_DIR/vm && docker compose -p codehub-$STACK -f docker-compose.$STACK.yml --env-file .env.$STACK exec -T worker sh -s -- --local /data/repos $APPLY_FLAG" <"$0"
