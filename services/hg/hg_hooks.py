from mercurial import node as nodemod

# Mainline bookmark. Pushes may create or move any bookmark freely, but
# `master` may only move forward: deleting it or moving it to a changeset
# that isn't a descendant of where it was (the hg analogue of a git
# force-push) is rejected. Same policy as services/git/hooks/pre-receive.
MASTER_BOOKMARK = b'master'


def protect_master_bookmark(ui, repo, hooktype, namespace=None, key=None, old=None, new=None, **kwargs):
    """prepushkey hook: runs before any pushkey (bookmark move/create, phase
    change, ...) coming from a client push is applied. Returning a truthy
    value aborts that pushkey. By the time a bookmark pushkey runs, the
    pushed changesets are already in the (uncommitted) transaction, so
    `new` resolves against the repo.
    """
    if namespace != b'bookmarks' or key != MASTER_BOOKMARK:
        return 0

    if not new:
        ui.warn(b"rejected: 'master' cannot be deleted\n")
        return 1

    if not old:
        return 0  # first push creating master

    cl = repo.unfiltered().changelog
    if not cl.isancestor(nodemod.bin(old), nodemod.bin(new)):
        ui.warn(b"rejected: 'master' can only move forward (non-fast-forward push)\n")
        return 1

    return 0
