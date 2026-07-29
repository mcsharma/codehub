import re

# Mainline pointer for the code-review feature (see services/hg/README.md).
# It may only move via the landing worker's own direct, on-disk `hg graft` +
# `hg bookmark -f master` (services/hg/land-review.sh) — never over the wire
# protocol — so this hook can reject *any* pushed attempt to move it, from
# anyone, with no trusted-identity exception to carve out.
MASTER_BOOKMARK = b'master'

# `ch submit` (cli/src/commands/submit.ts) always names its per-submission
# bookmark after the pushed changeset's own 12-hex-digit short node, and
# never reuses or force-moves one — that's what lets a plain `hg push`
# create a new head without hitting hg's "creates new remote head"
# safeguard. This is the only other bookmark shape a push may touch.
REVIEW_BOOKMARK_RE = re.compile(rb'^reviews/[0-9a-f]{12}$')


def reject_unsafe_bookmark_push(ui, repo, hooktype, namespace=None, key=None, old=None, new=None, **kwargs):
    """prepushkey hook: runs before any pushkey (bookmark move/create, phase
    change, ...) coming from a client push is applied. Returning a truthy
    value aborts just that pushkey, not the whole push transaction outright,
    but since a review-submitting client only ever sends its own
    `reviews/<hash>` bookmark, in practice a rejection here means the whole
    push didn't do what the client wanted and it'll surface as an error.
    """
    if namespace != b'bookmarks':
        return 0

    if key == MASTER_BOOKMARK:
        ui.warn(b"remote: rejected: 'master' can only move via review landing, not push\n")
        return 1

    if not REVIEW_BOOKMARK_RE.match(key):
        ui.warn(b"remote: rejected: bookmark '%s' must match reviews/<12-hex-node>\n" % key)
        return 1

    return 0
