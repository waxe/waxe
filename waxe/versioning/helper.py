CHANGE_TYPE_UNTRACKED = '?'
CHANGE_TYPE_ADDED = 'A'
CHANGE_TYPE_DELETED = 'D'
CHANGE_TYPE_MODIFIED = 'M'
CHANGE_TYPE_RENAMED = 'R'
CHANGE_TYPE_TYPE_CHANGED = 'T'
CHANGE_TYPE_CONFLICTED = 'U'


class FileStatus(object):

    def __init__(self, status, path, old_path=None):
        """
        old_path is only defined for renamed
        """
        self.status = status
        self.path = path
        self.old_path = old_path

    def __json__(self, request=None):
        return {
            'status': self.status,
            'path': self.path,
            'old_path': self.old_path,
        }

    def __hash__(self):
        return hash((self.path, self.old_path, self.status))

    def __repr__(self):
        return str(self.__json__())

    def __eq__(self, other):
        """Used in the test to compare objects
        """
        attrs = ['status', 'path', 'old_path']
        for attr in attrs:
            if getattr(self, attr) != getattr(other, attr):
                return False
        return True

    @staticmethod
    def load_from_git_diff(diff, reverse=False):
        if diff.change_type == CHANGE_TYPE_DELETED:
            change_type = CHANGE_TYPE_ADDED if reverse else CHANGE_TYPE_DELETED
            return FileStatus(change_type, diff.a_path)

        if diff.change_type == CHANGE_TYPE_ADDED:
            change_type = CHANGE_TYPE_DELETED if reverse else CHANGE_TYPE_ADDED
            return FileStatus(change_type, diff.b_path)

        if diff.change_type == CHANGE_TYPE_RENAMED:
            a_path = diff.a_path if reverse else diff.a_path
            b_path = diff.b_path if reverse else diff.b_path
            return FileStatus(CHANGE_TYPE_RENAMED, b_path, a_path)

        if diff.change_type == CHANGE_TYPE_MODIFIED:
            assert diff.a_path == diff.b_path
            return FileStatus(CHANGE_TYPE_MODIFIED, diff.b_path)

        if diff.change_type == CHANGE_TYPE_TYPE_CHANGED:
            assert diff.a_path == diff.b_path
            return FileStatus(CHANGE_TYPE_TYPE_CHANGED, diff.b_path)

        if diff.change_type == CHANGE_TYPE_CONFLICTED:
            assert diff.a_path == diff.b_path
            return FileStatus(CHANGE_TYPE_CONFLICTED, diff.b_path)

        raise NotImplementedError(
                'dif.change_type %s not supported.' % diff.change_type)


def git_status(repo):
    lis = []
    for f in repo.untracked_files:
        lis.append(FileStatus(CHANGE_TYPE_UNTRACKED, f))

    for diff in repo.index.diff('HEAD'):
        # Since we are making diff against HEAD, the value are inversed
        lis.append(FileStatus.load_from_git_diff(diff, reverse=True))

    for diff in repo.index.diff(None):
        lis.append(FileStatus.load_from_git_diff(diff, reverse=False))

    if not lis and repo.is_dirty(untracked_files=True):
        # TODO: better exception
        raise Exception('Status failed')

    conflicted = set([fs for fs in lis
                      if fs.status == CHANGE_TYPE_CONFLICTED])

    conflicted_paths = [fs.path for fs in conflicted]

    return (
        list(conflicted) +
        # A conflicted file can be in multiple diff so we need to make a filter
        # here to only display once.
        [fs for fs in lis if fs.path not in conflicted_paths]
    )


def _get_file_statuses(parent_commit, commit):
    diffs = parent_commit.diff(commit)
    lis = []
    for diff in diffs:
        lis.append(FileStatus.load_from_git_diff(diff))
    return lis


def get_current_branch(repo):
    try:
        return repo.active_branch
    except TypeError:
        # Raised when the branch is
        # detached
        return None


def git_fetch(repo):
    origin = repo.remotes.origin
    branch = get_current_branch(repo)

    res = origin.fetch()

    # Only get the info of the current branch from origin
    info = next(r for r in res if r.name == '%s/%s' % (
        origin.name, branch.name))

    if info.flags == info.HEAD_UPTODATE:
        # Already up to date
        return []

    if info.flags == info.FAST_FORWARD:
        return _get_file_statuses(repo, info.old_commit, info.commit)

    if info.flags == info.FORCED_UPDATE:
        # There was a git pull --force on the origin
        return _get_file_statuses(repo, info.old_commit, info.commit)

    # Other flags:
    # info.NEW_TAG
    # info.NEW_HEAD
    # info.REJECTED
    # info.ERROR
    raise NotImplementedError('Unsupported flags %i' % info.flags)


def git_rebase(repo):
    """
    NOTE: we can use autostash=True but it doesn't work for old git client so
    we do it manually.
    """
    def count_stash():
        return len(repo.git.stash('list').split('\n'))

    origin = repo.remotes.origin
    current_branch = get_current_branch(repo)

    before_cnt = count_stash()
    repo.git.stash('save')
    has_stash = count_stash() != before_cnt

    repo.git.rebase('%s/%s' % (origin.name, current_branch.name))

    if has_stash:
        # TODO: can raise an exception on conflict
        repo.git.stash('pop')


def update_repo(repo):
    file_statuses = git_fetch(repo)
    git_rebase(repo)
    return file_statuses


def git_commit(repo, files, author):
    statuses = git_status(repo)

    def _git_status(f):
        for s in statuses:
            if s.path == f:
                return s
        # TODO: nice exception
        raise Exception()

    for f in files:
        fstatus = _git_status(f)
        if fstatus.status == CHANGE_TYPE_UNTRACKED:
            repo.git.add(f)

    repo.git.commit(
        '-m', 'Update done by waxe website', author=author, *files)
    repo.git.push('origin', 'master')
