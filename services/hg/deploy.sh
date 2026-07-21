#!/usr/bin/env bash
# Deploys services/hg/ config to the DigitalOcean VM. Change-detects each
# file against what's already on the box and only restarts/reloads the
# service(s) actually affected. See README.md for the stack this manages.
#
# Usage: ./deploy.sh [--dry-run]

set -euo pipefail

HOST="root@143.110.207.184"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

remote_sha() {
  ssh "$HOST" "sha256sum '$1' 2>/dev/null | cut -d' ' -f1" || true
}

# Copies $1 (local) to $2 (remote path) if its content differs from what's
# already there. Echoes status; returns 0 if it deployed, 1 if unchanged.
deploy_file() {
  local local_file="$DIR/$1" remote_path="$2"
  local local_sha remote_sha_val
  local_sha=$(sha256sum "$local_file" | cut -d' ' -f1)
  remote_sha_val=$(remote_sha "$remote_path")
  if [[ "$local_sha" == "$remote_sha_val" ]]; then
    echo "  unchanged: $remote_path"
    return 1
  fi
  echo "  deploying: $1 -> $remote_path"
  run scp "$local_file" "$HOST:$remote_path"
  return 0
}

echo "== hgweb service deploy — $HOST $($DRY_RUN && echo '(dry run)') =="

hg_changed=false
deploy_file hgweb.ini /etc/hgweb.ini && hg_changed=true
deploy_file hgweb_wsgi.py /opt/hgservice/hgweb_wsgi.py && hg_changed=true

service_changed=false
deploy_file hgweb.service /etc/systemd/system/hgweb.service && service_changed=true

nginx_changed=false
deploy_file nginx-hgweb.conf /etc/nginx/sites-enabled/hgweb && nginx_changed=true

if $service_changed; then
  echo "-- hgweb.service changed: reloading systemd + restarting hgweb --"
  run ssh "$HOST" 'systemctl daemon-reload && rm -rf /opt/hgservice/__pycache__ && systemctl restart hgweb'
elif $hg_changed; then
  echo "-- hgweb config changed: restarting hgweb --"
  run ssh "$HOST" 'rm -rf /opt/hgservice/__pycache__ && systemctl restart hgweb'
fi

if { $hg_changed || $service_changed; } && ! $DRY_RUN; then
  echo "-- verifying hgweb came back up --"
  if ! ssh "$HOST" 'systemctl is-active --quiet hgweb'; then
    echo "ERROR: hgweb is not active after restart" >&2
    exit 1
  fi
fi

if $nginx_changed; then
  echo "-- nginx config changed: testing + reloading --"
  run ssh "$HOST" 'nginx -t && systemctl reload nginx'
fi

if ! $hg_changed && ! $service_changed && ! $nginx_changed; then
  echo "Nothing changed — VM already up to date."
fi

echo "== done =="
