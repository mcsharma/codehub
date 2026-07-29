#!/bin/bash
# Forced-command script for the BFF's dedicated landing SSH key
# (HG_VM_LAND_KEY, see README.md) — invoked as:
# ssh ... "<owner> <repo> <node>". Grafts the already-pushed <node> (synced
# earlier under a `reviews/<hash>` bookmark via `ch submit`) onto the
# `master` bookmark's tip, moves `master` forward, and publishes it. This is
# the ONLY way `master` ever moves — hg_hooks.py's prepushkey hook
# unconditionally rejects any attempt to move it over a normal push,
# precisely because this script (not the wire protocol) is the sole
# legitimate path. Re-validates owner/repo/node independently of the BFF's
# own validation, same reasoning as create-repo.sh/delete-repo.sh.
set -euo pipefail

read -r OWNER REPO NODE <<< "${SSH_ORIGINAL_COMMAND:-}"

[[ "$OWNER" =~ ^[a-z0-9-]+$ ]] || { echo "invalid owner" >&2; exit 1; }
[[ "$REPO" =~ ^[a-zA-Z0-9][a-zA-Z0-9._-]*$ ]] || { echo "invalid repo name" >&2; exit 1; }
[[ "$NODE" =~ ^[0-9a-f]{12,40}$ ]] || { echo "invalid node" >&2; exit 1; }

TARGET="/data/repos/$OWNER/$REPO"
[ -d "$TARGET" ] || { echo "no such repo" >&2; exit 2; }

cd "$TARGET"

hg log -r "$NODE" -T '{node}' >/dev/null 2>&1 || { echo "unknown node: $NODE" >&2; exit 3; }

if [ -z "$(hg log -r 'bookmark(master)' -T '{node}' 2>/dev/null)" ]; then
  # First-ever land for this repo: master doesn't exist yet, so <node>
  # becomes it directly — nothing to graft onto.
  hg update --clean -r "$NODE"
  hg bookmark -f master -r "$NODE"
else
  MASTER_NODE=$(hg log -r 'bookmark(master)' -T '{node}')
  PARENT_NODE=$(hg log -r "p1($NODE)" -T '{node}')
  if [ "$PARENT_NODE" = "$MASTER_NODE" ]; then
    # Fast-forward: <node> already builds directly on master's current tip.
    hg update --clean -r "$NODE"
    hg bookmark -f master -r "$NODE"
  else
    # master moved on since this review's base — graft (cherry-pick) it
    # instead. graft never touches/strips the source changeset, so the
    # review page's pinned headNode (<node>) stays resolvable forever
    # regardless of how landing rewrote it.
    hg update --clean -r 'bookmark(master)'
    if ! hg graft "$NODE"; then
      hg graft --abort >/dev/null 2>&1 || true
      echo "graft conflict — base has diverged too far, needs a manual rebase and resubmit" >&2
      exit 4
    fi
    hg bookmark -f master -r .
  fi
fi

hg phase --public -r 'bookmark(master)'
hg log -r 'bookmark(master)' -T '{node}\n'
