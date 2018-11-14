CHANGE_TYPE_UNTRACKED = '?'
CHANGE_TYPE_ADDED = 'A'
CHANGE_TYPE_DELETED = 'D'
CHANGE_TYPE_MODIFIED = 'M'
CHANGE_TYPE_RENAMED = 'R'
CHANGE_TYPE_TYPE_CHANGED = 'T'


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

    return lis


def _get_file_statuses(parent_commit, commit):
    diffs = parent_commit.diff(commit)
    lis = []
    for diff in diffs:
        lis.append(FileStatus.load_from_git_diff(diff))
    return lis


def git_pull(repo):
    current_commit = repo.commit()

    origin = repo.remotes.origin
    res = origin.pull()

    new_commit = repo.commit()

    if current_commit == new_commit:
        return []

    assert(len(res) == 1)

    for info in res:
        if info.flags != info.HEAD_UPTODATE:
            # TODO: nice exception
            raise Exception()
    return _get_file_statuses(current_commit, new_commit)


def git_commit(repo, files):
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
        '-m', 'Update done by waxe website', author='Webmaster <webmaster@lereskp.fr>',
        *files)
