#!/usr/bin/env bash
# Deploys services/git/ (git-app image, worker image, that stack's compose
# file/nginx config) to the DigitalOcean VM and brings one Docker Compose
# stack (codehub-git-prod or codehub-git-test) up to date. See README.md
# for the architecture this manages. Deliberately its own script rather
# than a generalization of services/hg/deploy.sh — keeps each service
# type's deploy script trivially readable, and avoids adding a branch to a
# script that's explicitly frozen for hg (see
# docs/plans/zesty-zooming-cupcake.md).
#
# Usage: ./deploy.sh <prod|test> [--dry-run]
#
# Deliberately one stack per invocation, not both — so you can deploy
# test, verify it, and only then deploy prod, rather than always shipping
# both together sight-unseen.

set -euo pipefail

usage() {
  echo "Usage: $0 <prod|test> [--dry-run]" >&2
  exit 1
}

STACK=""
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    prod|test)
      STACK="$arg"
      ;;
    --dry-run)
      DRY_RUN=true
      ;;
    *)
      usage
      ;;
  esac
done
[[ -n "$STACK" ]] || usage

HOST="root@143.110.207.184"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Separate per-stack, same reasoning as services/hg/deploy.sh: a shared
# directory would mean a test-only deploy's rsync still overwrites the
# config files prod's already-running containers have bind-mounted
# (etc/gitconfig, hooks/ take effect on a live container without a
# restart), silently leaking config changes into prod before prod is ever
# explicitly deployed.
REMOTE_DIR="/opt/codehub-git-$STACK"

run() {
  if $DRY_RUN; then
    echo "  + $*"
  else
    "$@"
  fi
}

echo "== git stack deploy — $STACK @ $HOST $($DRY_RUN && echo '(dry run)') =="

echo "-- syncing services/git/ to $REMOTE_DIR --"
run rsync -az --delete \
  --exclude 'vm/.env.*' \
  --exclude 'vm/hook-config.*.env' \
  --exclude '.git' \
  "$DIR/" "$HOST:$REMOTE_DIR/"

echo "-- $STACK: docker compose up -d --build --"
run ssh "$HOST" "cd $REMOTE_DIR/vm && docker compose -p codehub-git-$STACK -f docker-compose.$STACK.yml --env-file .env.$STACK up -d --build"

if ! $DRY_RUN; then
  echo "-- verifying $STACK is up --"
  if ! ssh "$HOST" "docker compose -p codehub-git-$STACK -f $REMOTE_DIR/vm/docker-compose.$STACK.yml --env-file $REMOTE_DIR/vm/.env.$STACK ps --status running --quiet | grep -q ."; then
    echo "ERROR: $STACK stack has no running containers after deploy" >&2
    exit 1
  fi
fi

echo "== done =="
