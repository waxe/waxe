import shutil
import tempfile

from git import Repo

from waxe.versioning import helper
from .helper import BaseGitRepo


class TestHelper(BaseGitRepo):

    def test_git_status(self):
        res = helper.git_status(self.repo)
        self.assertEqual(len(res), 5)

        expected = [
            {'status': '?', 'path': u'file4.txt', 'old_path': None},
            {'status': 'D', 'path': u'file0.txt', 'old_path': None},
            {'status': 'T', 'path': u'file2.txt', 'old_path': None},
            {'status': 'A', 'path': u'file3.txt', 'old_path': None},
            {'status': 'M', 'path': u'file1.txt', 'old_path': None},
        ]
        expected = [helper.FileStatus(**e) for e in expected]
        self.assertEqual(res, expected)

    def test__get_file_statuses(self):
        commit = self.repo.commit()
        res = helper._get_file_statuses(commit.parents[0], commit)
        expected = [
            {'status': 'A', 'path': u'file2.txt', 'old_path': None},
        ]
        expected = [helper.FileStatus(**e) for e in expected]
        self.assertEqual(res, expected)

    def test_git_pull(self):
        directory = tempfile.mkdtemp()
        try:
            self.repo.clone(directory)
            repo = Repo(directory)
            repo.git.reset('HEAD~2', hard=True)
            res = helper.git_pull(repo)
            expected = [
                {'status': 'A', 'path': u'file1.txt', 'old_path': None},
                {'status': 'A', 'path': u'file2.txt', 'old_path': None},
            ]
            expected = [helper.FileStatus(**e) for e in expected]
            self.assertEqual(res, expected)
        finally:
            shutil.rmtree(directory)

    def test_git_commit(self):
        def assert_status(res, expected):
            new_expected = [helper.FileStatus(**e) for e in expected]
            self.assertEqual(res, new_expected)

        res = helper.git_status(self.repo)
        expected = [
            {'status': '?', 'path': u'file4.txt', 'old_path': None},
            {'status': 'D', 'path': u'file0.txt', 'old_path': None},
            {'status': 'T', 'path': u'file2.txt', 'old_path': None},
            {'status': 'A', 'path': u'file3.txt', 'old_path': None},
            {'status': 'M', 'path': u'file1.txt', 'old_path': None},
        ]
        assert_status(res, expected)

        filenames = [e['path'] for e in expected]

        for f in filenames:
            helper.git_commit(self.repo, [f], author='Tester<test@lereskp.fr>')
            expected.pop(0)
            res = helper.git_status(self.repo)
            assert_status(res, expected)

        self.assertEqual(expected, [])
