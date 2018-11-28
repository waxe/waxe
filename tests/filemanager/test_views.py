# # -*- coding: utf-8 -*-

import os
import unittest
from mock import mock_open, patch

import pyramid.httpexceptions as exc
from pyramid import testing

from waxe.filemanager.views import (
    BaseView,
    FilesPostView,
    FilesView,
)


here = os.path.realpath(os.path.dirname(__file__))
ROOT_PATH = os.path.normpath(os.path.join(here, '../', 'dir'))


class TestBaseView(unittest.TestCase):

    def setUp(self):
        request = testing.DummyRequest()
        request.registry.settings = {
            'root_path': ROOT_PATH
        }
        self.view = BaseView(request)

    def test_path_to_relpath(self):
        path = os.path.join(ROOT_PATH, 'dir1')
        res = self.view.path_to_relpath(path)
        self.assertEqual(res, 'dir1')

    def test_remove_abspath(self):
        path = os.path.join(ROOT_PATH, 'dir1')
        s = 'Hello %s world' % path
        res = self.view.remove_abspath(s)
        self.assertEqual(res, 'Hello dir1 world')


class TestFilesView(unittest.TestCase):

    def test___init__(self):
        request = testing.DummyRequest()
        view = FilesView(request)
        self.assertEqual(view.abspath, ROOT_PATH)

        request = testing.DummyRequest({'path': 'unexisting'})
        self.assertRaises(exc.HTTPNotFound, FilesView, request)

        request = testing.DummyRequest({'path': 'dir1'})
        view = FilesView(request)
        self.assertEqual(view.abspath, os.path.join(ROOT_PATH, 'dir1'))

    def test_files_view(self):
        request = testing.DummyRequest()
        view = FilesView(request)
        res = view.files_view()
        expected = [
            {'path': 'dir1', 'type': 'folder', 'name': 'dir1'},
            {'path': 'dir2', 'type': 'folder', 'name': 'dir2'},
            {'path': 'file1.txt', 'type': 'file',
             'name': 'file1.txt', 'thumbnail': None},
            {'path': 'file2.txt', 'type': 'file',
             'name': 'file2.txt', 'thumbnail': None},
            {'path': 'file3.xml', 'type': 'file',
             'name': 'file3.xml', 'thumbnail': None},
            {'path': 'file4.html', 'type': 'file',
             'name': 'file4.html', 'thumbnail': None}
        ]
        self.assertEqual(res, expected)

        request = testing.DummyRequest({'path': 'dir1'})
        view = FilesView(request)
        res = view.files_view()
        expected = [
            {'path': 'dir1/sub1', 'type': 'folder', 'name': 'sub1'},
        ]
        self.assertEqual(res, expected)

    def test_source(self):
        request = testing.DummyRequest({'path': 'dir1'})
        view = FilesView(request)
        self.assertRaises(exc.HTTPNotFound, view.source)

        request = testing.DummyRequest({'path': 'file1.txt'})
        view = FilesView(request)
        res = view.source()
        expected = {'source': u'File 1 content with à accent\n'}
        self.assertEqual(res, expected)


class TestFilesPostView(unittest.TestCase):

    def test___init__(self):
        request = testing.DummyRequest(json_body={})
        view = FilesPostView(request)
        self.assertEqual(view.abspath, ROOT_PATH)

        request = testing.DummyRequest(json_body={'path': 'unexisting'})
        self.assertRaises(exc.HTTPNotFound, FilesPostView, request)

        request = testing.DummyRequest(json_body={'path': 'dir1'})
        view = FilesPostView(request)
        self.assertEqual(view.abspath, os.path.join(ROOT_PATH, 'dir1'))

    def test_update(self):
        request = testing.DummyRequest(json_body={'path': 'dir1'})
        view = FilesPostView(request)
        self.assertRaises(exc.HTTPNotFound, view.update)

        request = testing.DummyRequest(json_body={'path': 'file1.txt'})
        view = FilesPostView(request)
        self.assertRaises(exc.HTTPBadRequest, view.update)

        request = testing.DummyRequest(json_body={
            'path': 'file1.txt',
            'source': u'Update the file à content'
        })
        with patch('__builtin__.open', mock_open()) as m:
            view = FilesPostView(request)
            view.update()
            m.assert_called_once_with(
                os.path.join(ROOT_PATH, 'file1.txt'), 'w')
            handle = m()
            handle.write.assert_called_once_with(
                u'Update the file à content'.encode('utf-8'))

    def test_create(self):
        request = testing.DummyRequest(json_body={})
        view = FilesPostView(request)
        res = view.create()
        self.assertEqual(request.response.status_code, 400)
        expected = {'errors': {'name': "Name is required"}}
        self.assertEqual(res, expected)

        request = testing.DummyRequest(json_body={'name': 'file1.txt'})
        view = FilesPostView(request)
        res = view.create()
        self.assertEqual(request.response.status_code, 409)
        expected = {'errors': {'name': "File 'file1.txt' already exists"}}
        self.assertEqual(res, expected)

        request = testing.DummyRequest(json_body={'name': 'newfile.txt'})
        view = FilesPostView(request)
        with patch('__builtin__.open', mock_open()) as m:
            res = view.create()
            self.assertEqual(request.response.status_code, 200)
            self.assertEqual(res, {})
            m.assert_called_once_with(
                os.path.join(ROOT_PATH, 'newfile.txt'), 'w')
            handle = m()
            handle.write.assert_called_once_with('')

        request = testing.DummyRequest(json_body={
            'name': 'newfile.txt',
            'source': u'New file à content',
        })
        view = FilesPostView(request)
        with patch('__builtin__.open', mock_open()) as m:
            res = view.create()
            self.assertEqual(request.response.status_code, 200)
            self.assertEqual(res, {})
            m.assert_called_once_with(
                os.path.join(ROOT_PATH, 'newfile.txt'), 'w')
            handle = m()
            handle.write.assert_called_once_with(
                u'New file à content'.encode('utf-8'))

    def test_create_folder(self):
        request = testing.DummyRequest(json_body={})
        view = FilesPostView(request)
        res = view.create_folder()
        self.assertEqual(request.response.status_code, 400)
        expected = {'errors': {'name': "Name is required"}}
        self.assertEqual(res, expected)

        request = testing.DummyRequest(json_body={'name': 'dir1'})
        view = FilesPostView(request)
        res = view.create_folder()
        self.assertEqual(request.response.status_code, 409)
        expected = {'errors': {'name': "Folder 'dir1' already exists"}}
        self.assertEqual(res, expected)

        request = testing.DummyRequest(json_body={'name': 'newdir'})
        view = FilesPostView(request)
        with patch('os.mkdir') as m:
            res = view.create_folder()
            m.assert_called_once_with(os.path.join(ROOT_PATH, 'newdir'))

        request = testing.DummyRequest(json_body={
            'name': 'newdir',
            'path': 'dir1',
        })
        view = FilesPostView(request)
        with patch('os.mkdir') as m:
            res = view.create_folder()
            m.assert_called_once_with(
                os.path.join(ROOT_PATH, 'dir1', 'newdir'))

    def test_rename(self):
        request = testing.DummyRequest(json_body={})
        view = FilesPostView(request)
        res = view.rename()
        self.assertEqual(request.response.status_code, 400)
        expected = {'errors': {'name': "Name is required"}}
        self.assertEqual(res, expected)

        request = testing.DummyRequest(json_body={
            'path': 'dir2',
            'name': 'dir1',
        })
        view = FilesPostView(request)
        res = view.rename()
        self.assertEqual(request.response.status_code, 409)
        expected = {'errors': {'name': "'dir1' already exists"}}
        self.assertEqual(res, expected)

        request = testing.DummyRequest(json_body={
            'path': 'dir2',
            'name': 'newdir',
        })
        view = FilesPostView(request)
        with patch('shutil.move') as m:
            res = view.rename()
            self.assertEqual(request.response.status_code, 200)
            m.assert_called_once_with(
                os.path.join(ROOT_PATH, 'dir2'),
                os.path.join(ROOT_PATH, 'newdir'),
            )

        request = testing.DummyRequest(json_body={
            'path': 'file1.txt',
            'name': 'newfile.txt',
        })
        view = FilesPostView(request)
        with patch('shutil.move') as m:
            res = view.rename()
            self.assertEqual(request.response.status_code, 200)
            m.assert_called_once_with(
                os.path.join(ROOT_PATH, 'file1.txt'),
                os.path.join(ROOT_PATH, 'newfile.txt'),
            )
