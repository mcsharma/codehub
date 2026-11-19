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
  --exclude 'node_modules' \
  "$DIR/" "$HOST:$REMOTE_DIR/"

# Build images one service at a time, then bring the stack up without
# rebuilding. A plain `up -d --build` builds every image in parallel, and on
# this 1 GB, swapless VM that exhausts memory and thrashes every stack on
# the box, prod included (load average ~78 the one time it happened).
# Services with no build section (nginx) are skipped by `build`.
#
# hgweb-proxy is always restarted afterwards: nginx resolves upstream hostnames
# once at startup, so if `up` recreates the app containers (new IPs) but
# leaves the proxy running, every request 502s (see the root README's
# "Operational gotchas").
COMPOSE="docker compose -p codehub-$STACK -f docker-compose.$STACK.yml --env-file .env.$STACK"
echo "-- $STACK: building images sequentially, then docker compose up -d --"
run ssh "$HOST" "cd $REMOTE_DIR/vm && for svc in \$($COMPOSE config --services); do echo \"   building \$svc\" && $COMPOSE build \$svc || exit 1; done && $COMPOSE up -d --no-build && $COMPOSE restart hgweb-proxy"

if ! $DRY_RUN; then
  echo "-- verifying $STACK is up --"
  if ! ssh "$HOST" "docker compose -p codehub-$STACK -f $REMOTE_DIR/vm/docker-compose.$STACK.yml --env-file $REMOTE_DIR/vm/.env.$STACK ps --status running --quiet | grep -q ."; then
    echo "ERROR: $STACK stack has no running containers after deploy" >&2
    exit 1
  fi
fi

echo "== done =="
