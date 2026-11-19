#!/bin/sh
# One-off cleanup after code review was removed: for every bare git repo in
# one stack, deletes the leftover refs/reviews/<sha> refs, then prunes the
# commits only they kept alive. Dry run by default.
#
# Usage (from your machine):  ./cleanup-reviews.sh <prod|test> [--apply]
#
# It pipes itself over ssh into that stack's worker container and re-runs
# there with `--local /data/repos`, so it's POSIX sh (the container is
# alpine). Unlike hg's strip there's no backup: pruned commits are gone.
set -eu

if [ "${1:-}" = "--local" ]; then
  REPOS_DIR="$2"
  APPLY=false
  [ "${3:-}" = "--apply" ] && APPLY=true

  for repo in "$REPOS_DIR"/*/*; do
    [ -f "$repo/HEAD" ] && [ -d "$repo/objects" ] || continue
    name="${repo#"$REPOS_DIR"/}"

    refs="$(git -c safe.directory="*" -C "$repo" for-each-ref --format='%(refname)' refs/reviews/)"
    [ -z "$refs" ] && continue

    echo "== $name"
    echo "  refs to delete: $(echo "$refs" | wc -l | tr -d ' ')"
    # Commits reachable only from review refs, i.e. never landed.
    # shellcheck disable=SC2086 # intentional word-splitting: one ref per word
    commits="$(git -c safe.directory="*" -C "$repo" rev-list --oneline $refs --not --exclude='refs/reviews/*' --all)"
    if [ -n "$commits" ]; then
      echo "  commits to prune:"
      echo "$commits" | sed 's/^/    /'
    fi

    if $APPLY; then
      echo "$refs" | sed 's/^/delete /' | git -c safe.directory="*" -C "$repo" update-ref --stdin
      git -c safe.directory="*" -C "$repo" reflog expire --expire=now --all
      git -c safe.directory="*" -C "$repo" gc --prune=now --quiet
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
REMOTE_DIR="/opt/codehub-git-$STACK"
ssh "$HOST" "cd $REMOTE_DIR/vm && docker compose -p codehub-git-$STACK -f docker-compose.$STACK.yml --env-file .env.$STACK exec -T worker sh -s -- --local /data/repos $APPLY_FLAG" <"$0"
