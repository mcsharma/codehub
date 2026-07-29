#!/usr/bin/env bash
# Deploys services/hg/ (hgweb image, worker image, both stacks' compose
# files/nginx config) to the DigitalOcean VM and brings both Docker Compose
# stacks (codehub-prod, codehub-test) up to date. See README.md for the
# architecture this manages — no more per-file scp/systemctl change
# detection now that everything's containerized; both images build fast
# enough that an unconditional `docker compose up -d --build` per stack is
# simpler and just as fast in practice.
#
# Usage: ./deploy.sh [--dry-run]

set -euo pipefail

HOST="root@143.110.207.184"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE_DIR="/opt/codehub-hg"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

run() {
  if $DRY_RUN; then
    echo "  + $*"
  else
    "$@"
  fi
}

echo "== hg stack deploy — $HOST $($DRY_RUN && echo '(dry run)') =="

echo "-- syncing services/hg/ to $REMOTE_DIR --"
run rsync -az --delete \
  --exclude 'local-data' \
  --exclude 'vm/.env.*' \
  --exclude '.git' \
  "$DIR/" "$HOST:$REMOTE_DIR/"

for stack in prod test; do
  echo "-- $stack: docker compose up -d --build --"
  run ssh "$HOST" "cd $REMOTE_DIR/vm && docker compose -p codehub-$stack -f docker-compose.$stack.yml --env-file .env.$stack up -d --build"
done

if ! $DRY_RUN; then
  echo "-- verifying both stacks are up --"
  for stack in prod test; do
    if ! ssh "$HOST" "docker compose -p codehub-$stack -f $REMOTE_DIR/vm/docker-compose.$stack.yml --env-file $REMOTE_DIR/vm/.env.$stack ps --status running --quiet | grep -q ."; then
      echo "ERROR: $stack stack has no running containers after deploy" >&2
      exit 1
    fi
  done
fi

echo "== done =="
