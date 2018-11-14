# # -*- coding: utf-8 -*-

import os
import shutil
import tempfile

from git import Repo
from mock import patch
from pyramid import testing

from waxe.versioning.views import (
    GitView,
)

from waxe.versioning import helper

from .helper import BaseGitRepo


class TestGitView(BaseGitRepo):

    def setUp(self):
        super(TestGitView, self).setUp()
        self.view = GitView(testing.DummyRequest())
        self.view.root_path = self.directory

    def test_status(self):
        res = self.view.status()
        expected = [
            {'status': '?', 'path': u'file4.txt', 'old_path': None},
            {'status': 'D', 'path': u'file0.txt', 'old_path': None},
            {'status': 'T', 'path': u'file2.txt', 'old_path': None},
            {'status': 'A', 'path': u'file3.txt', 'old_path': None},
            {'status': 'M', 'path': u'file1.txt', 'old_path': None},
        ]
        expected = [helper.FileStatus(**e) for e in expected]
        self.assertEqual(res, {'status': expected})

    def test_pull(self):
        directory = tempfile.mkdtemp()
        try:
            self.repo.clone(directory)
            repo = Repo(directory)
            self.view.root_path = directory
            res = self.view.pull()
            expected = {'msg': 'The repo was already up to date.'}
            self.assertEqual(res, expected)
            repo.git.reset('HEAD~1', hard=True)
            res = self.view.pull()
            expected = {
                'msg': 'List of files modified since your last update:',
                'status': [helper.FileStatus(**{
                    'status': 'A',
                    'path': u'file2.txt',
                    'old_path': None
                })]
            }
            self.assertEqual(res, expected)
        finally:
            shutil.rmtree(directory)

    def test_commit(self):
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

        request = testing.DummyRequest(json_body={'paths': ['file4.txt']})
        view = GitView(request)
        view.root_path = self.directory
        res = view.commit()
        self.assertEqual(res, {})
        expected.pop(0)
        res = helper.git_status(self.repo)
        assert_status(res, expected)
