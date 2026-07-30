#!/usr/bin/env bash
# Deploys services/hg/ (hgweb image, worker image, that stack's compose
# file/nginx config) to the DigitalOcean VM and brings one Docker Compose
# stack (codehub-prod or codehub-test) up to date. See README.md for the
# architecture this manages — no more per-file scp/systemctl change
# detection now that everything's containerized; the image builds fast
# enough that an unconditional `docker compose up -d --build` is simpler
# and just as fast in practice.
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
# Separate per-stack, deliberately — a shared directory would mean a
# test-only deploy's rsync still overwrites the config files prod's
# already-running containers have bind-mounted (hgweb.ini/hg_hooks.py/nginx
# confs take effect on a live container without a restart), silently
# leaking config changes into prod before prod is ever explicitly deployed.
REMOTE_DIR="/opt/codehub-hg-$STACK"

run() {
  if $DRY_RUN; then
    echo "  + $*"
  else
    "$@"
  fi
}

echo "== hg stack deploy — $STACK @ $HOST $($DRY_RUN && echo '(dry run)') =="

echo "-- syncing services/hg/ to $REMOTE_DIR --"
run rsync -az --delete \
  --exclude 'vm/.env.*' \
  --exclude '.git' \
  "$DIR/" "$HOST:$REMOTE_DIR/"

echo "-- $STACK: docker compose up -d --build --"
run ssh "$HOST" "cd $REMOTE_DIR/vm && docker compose -p codehub-$STACK -f docker-compose.$STACK.yml --env-file .env.$STACK up -d --build"

if ! $DRY_RUN; then
  echo "-- verifying $STACK is up --"
  if ! ssh "$HOST" "docker compose -p codehub-$STACK -f $REMOTE_DIR/vm/docker-compose.$STACK.yml --env-file $REMOTE_DIR/vm/.env.$STACK ps --status running --quiet | grep -q ."; then
    echo "ERROR: $STACK stack has no running containers after deploy" >&2
    exit 1
  fi
fi

echo "== done =="
