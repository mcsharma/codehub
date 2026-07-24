#!/bin/bash
# Forced-command script for the BFF's dedicated, restricted SSH key (see
# README.md). Invoked as: ssh ... "<owner> <repo>" — the requested command
# becomes $SSH_ORIGINAL_COMMAND regardless of what's configured here, since
# authorized_keys forces this script to run no matter what the client asks
# for. Re-validates owner/repo independently of the BFF's own validation,
# since this is the thing actually touching the filesystem. Deliberately a
# separate key/script from create-repo.sh — a leaked create key can only
# create junk repos, not destroy existing ones.
set -euo pipefail

read -r OWNER REPO <<< "${SSH_ORIGINAL_COMMAND:-}"

[[ "$OWNER" =~ ^[a-z0-9-]+$ ]] || { echo "invalid owner" >&2; exit 1; }
[[ "$REPO" =~ ^[a-zA-Z0-9][a-zA-Z0-9._-]*$ ]] || { echo "invalid repo name" >&2; exit 1; }

TARGET="/data/repos/$OWNER/$REPO"

# Idempotent: deleting something already gone is success, not an error, so
# retries and races are safe.
if [ ! -e "$TARGET" ]; then
  echo OK
  exit 0
fi

rm -rf "$TARGET"
echo OK
