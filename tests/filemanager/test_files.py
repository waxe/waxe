from mock import patch
import unittest
import os

from waxe.filemanager.files import (
    absolute_path,
    cleanup_path,
    copytree,
    get_folders_and_files,
    relative_path,
)


here = os.path.realpath(os.path.dirname(__file__))
ROOT_PATH = os.path.normpath(os.path.join(here, '../', 'dir'))


class TestFiles(unittest.TestCase):

    def test_relative_path(self):
        root_path = ROOT_PATH
        assert os.path.exists(root_path)
        try:
            relpath = relative_path(root_path, '.')
            assert(False)
        except IOError, e:
            self.assertEqual(str(e), ". doesn't exist")

        try:
            relpath = relative_path(root_path, 'test')
            assert(False)
        except IOError, e:
            self.assertEqual(str(e), "test doesn't exist")

        relpath = relative_path(root_path, root_path)
        self.assertEqual(relpath, '.')

        relpath = relative_path(root_path, root_path + '/folder')
        self.assertEqual(relpath, 'folder')

        relpath = relative_path(root_path, root_path + '/folder/file.xml')
        self.assertEqual(relpath, 'folder/file.xml')

        path = os.path.normpath(root_path + '/../../folder/file.xml')
        try:
            relpath = relative_path(root_path, path)
            assert(False)
        except IOError, e:
            pass

    def test_absolute_path(self):
        root_path = ROOT_PATH
        relpath = 'folder1'
        abspath = absolute_path(root_path, relpath)
        self.assertEqual(abspath, os.path.join(root_path, 'folder1'))

        relpath = ''
        abspath = absolute_path(root_path, relpath)
        self.assertEqual(abspath, root_path)

        relpath = 'folder1/file.xml'
        abspath = absolute_path(root_path, relpath)
        self.assertEqual(abspath, os.path.join(root_path, 'folder1/file.xml'))

        relpath = '/folder1/file.xml'
        try:
            absolute_path(root_path, relpath)
            assert(False)
        except IOError, e:
            self.assertEqual(str(e), "/folder1/file.xml doesn't exist")

        relpath = '../folder1/file.xml'
        try:
            absolute_path(root_path, relpath)
            assert(False)
        except IOError, e:
            self.assertEqual(str(e), "../folder1/file.xml doesn't exist")

    def test_cleanup_path(self):
        root_path = ROOT_PATH
        s = 'Hello %s/ world' % root_path
        res = cleanup_path(root_path, s)
        self.assertEqual(res, 'Hello  world')

        s = root_path
        res = cleanup_path(root_path, s)
        self.assertEqual(res, '')

    def test_get_folders_and_files(self):
        root_path = ROOT_PATH
        folders, files = get_folders_and_files(root_path)
        res = [relative_path(root_path, f) for f in folders + files]
        expected = [
            'dir1', 'dir2',
            'file1.txt', 'file2.txt', 'file3.xml', 'file4.html'
        ]
        self.assertEqual(res, expected)

        folders, files = get_folders_and_files(root_path,
                                               exts=['.html', '.xml'])
        res = [relative_path(root_path, f) for f in folders + files]
        expected = [
            'dir1', 'dir2',
            'file3.xml', 'file4.html'
        ]
        self.assertEqual(res, expected)

    @patch('shutil.copy2')
    @patch('os.makedirs')
    def test_copytree(self, m_mkdir, m_copy):
        root_path = ROOT_PATH
        res = copytree('%s/dir1' % root_path, root_path)
        self.assertEqual(m_copy.call_args_list, [])
        self.assertEqual(m_mkdir.call_args_list, [])
        res = [cleanup_path(ROOT_PATH, e) for e in res]
        expected = [
            'dir1 already exists'
        ]
        self.assertEqual(res, expected)

        res = copytree(root_path, os.path.join(root_path, 'copied'))
        self.assertEqual(res, [])
        copied = []
        for args, kw in sorted(m_copy.call_args_list):
            self.assertEqual(kw, {})
            self.assertEqual(len(args), 2)
            copied.append(args)

        folder = []
        for args, kw in sorted(m_mkdir.call_args_list):
            self.assertEqual(kw, {})
            self.assertEqual(len(args), 1)
            folder.append(args[0])

        copied = [(cleanup_path(root_path, src),
                   cleanup_path(root_path, dst))
                  for (src, dst) in copied]

        folder = [cleanup_path(root_path, f) for f in folder]
        expected = [
            ('dir1/sub1/sub1.txt', 'copied/dir/dir1/sub1/sub1.txt'),
            ('file1.txt', 'copied/dir/file1.txt'),
            ('file2.txt', 'copied/dir/file2.txt'),
            ('file3.xml', 'copied/dir/file3.xml'),
            ('file4.html', 'copied/dir/file4.html')
        ]
        self.assertEqual(copied, expected)
        expected = [
            'copied/dir',
            'copied/dir',
            'copied/dir',
            'copied/dir',
            'copied/dir',
            'copied/dir/dir1',
            'copied/dir/dir1/sub1',
            'copied/dir/dir1/sub1',
            'copied/dir/dir2',
        ]
        self.assertEqual(folder, expected)

        m_copy.reset_mock()
        m_mkdir.reset_mock()
        res = copytree('%s/file1.txt' % root_path,
                       os.path.join(root_path, 'copied'))
        self.assertEqual(res, [])
        copied = []
        for args, kw in sorted(m_copy.call_args_list):
            self.assertEqual(kw, {})
            self.assertEqual(len(args), 2)
            copied.append(args)

        folder = []
        for args, kw in sorted(m_mkdir.call_args_list):
            self.assertEqual(kw, {})
            self.assertEqual(len(args), 1)
            folder.append(args[0])

        copied = [(cleanup_path(root_path, src),
                   cleanup_path(root_path, dst))
                  for (src, dst) in copied]

        folder = [cleanup_path(root_path, f) for f in folder]

        expected = [
            ('file1.txt', 'copied/file1.txt'),
        ]
        self.assertEqual(copied, expected)
        self.assertEqual(folder, ['copied'])
