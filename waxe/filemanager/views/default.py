import base64
import os
from paste.util.import_string import eval_import
import shutil

from pyramid.view import view_config
import pyramid.httpexceptions as exc

from .base import BaseGetView, BasePostView
from ..files import (
    copytree,
    get_folders_and_files,
)


class FilesView(BaseGetView):

    # TODO: remove OPTIONS for production
    # OPTIONS is called when there is a cross domain
    # We need to create a small view to response to OPTIONS
    @view_config(route_name='files', request_method=('GET', 'OPTIONS'))
    def files_view(self):
        """Get the folders and the files for the given path
        """
        try:
            folders, filenames = get_folders_and_files(self.abspath)
        except IOError, e:
            raise exc.HTTPNotFound(self.remove_abspath(str(e)))

        lis = []

        for folder in folders:
            lis += [{
                'name': os.path.basename(folder),
                'type': 'folder',
                'path': self.path_to_relpath(folder),
            }]
        for filename in filenames:
            thumbnail = None
            if filename.endswith('.png'):
                thumbnail = 'data:image/png;base64,' + base64.b64encode(open(filename, 'rb').read())
            lis += [{
                'name': os.path.basename(filename),
                'type': 'file',
                'path': self.path_to_relpath(filename),
                'thumbnail': thumbnail,
            }]
        return lis

    @view_config(route_name='all_files', request_method=('GET', 'OPTIONS'))
    def all_files_view(self):
        """Get the all the files
        """
        try:
            folders, filenames = get_folders_and_files(self.abspath,
                                                       recursive=True)
        except IOError, e:
            raise exc.HTTPNotFound(self.remove_abspath(str(e)))

        lis = []
        for filename in filenames:
            lis.append(self.path_to_relpath(filename))
        return lis

    @view_config(route_name='source')
    def source(self):
        if not os.path.isfile(self.abspath):
            raise exc.HTTPNotFound()

        def transform(s):
            func_str = self.request.registry.settings.get(
                'transform_before_edit')
            if func_str:
                return eval_import(func_str)(self.abspath, s)
            return s

        content = open(self.abspath, 'r').read()
        content = transform(content.decode('utf-8'))
        return {
            'source': content,
        }


class FilesPostView(BasePostView):

    @view_config(route_name='files', request_method='PUT')
    def update(self):
        if not os.path.isfile(self.abspath):
            raise exc.HTTPNotFound()

        source = self.request.json_body.get('source')

        if source is None:
            raise exc.HTTPBadRequest()

        def transform(s):
            func_str = self.request.registry.settings.get(
                'transform_after_edit')
            if func_str:
                return eval_import(func_str)(self.abspath, s)
            return s

        with open(self.abspath, 'w') as f:
            f.write(transform(source.encode('utf-8')))

        return {}

    @view_config(route_name='files', request_method='POST')
    def create(self):
        name = self.request.json_body.get('name')

        if not name:
            self.request.response.status = 400
            return {'errors': {'name': 'Name is required'}}

        abspath = os.path.join(self.abspath, name)
        if os.path.exists(abspath):
            self.request.response.status = 409
            return {'errors': {'name': "File '%s' already exists" % name}}

        # TODO: perhaps we should also transform the source here.
        # Right now we can't create a file with content so it's okay.
        source = self.request.json_body.get('source') or ''

        with open(abspath, 'w') as f:
            f.write(source.encode('utf-8'))

        return {}

    @view_config(route_name='create_folder', request_method='POST')
    def create_folder(self):
        name = self.request.json_body.get('name')

        if not name:
            self.request.response.status = 400
            return {'errors': {'name': 'Name is required'}}

        abspath = os.path.join(self.abspath, name)
        if os.path.exists(abspath):
            self.request.response.status = 409
            return {'errors': {'name': "Folder '%s' already exists" % name}}

        try:
            os.mkdir(abspath)
        except Exception, e:
            self.request.response.status = 500
            return {
                'message': 'Internal error: %s' % (
                    self.remove_abspath(unicode(e)))
            }

        return {
            'file': {
                'name': name,
                'type': 'folder',
                'path': self.path_to_relpath(abspath),
            }
        }

    @view_config(route_name='rename', request_method='POST')
    def rename(self):
        name = self.request.json_body.get('name')

        if not name:
            self.request.response.status = 400
            return {'errors': {'name': 'Name is required'}}

        new_abspath = os.path.join(os.path.dirname(self.abspath), name)
        if os.path.exists(new_abspath):
            self.request.response.status = 409
            return {'errors': {'name': "'%s' already exists" % name}}

        try:
            shutil.move(self.abspath, new_abspath)
        except Exception, e:
            self.request.response.status = 500
            return {
                'message': 'Internal error: %s' % (
                    self.remove_abspath(unicode(e)))
            }

        return {
            'file': {
                'name': name,
                'type': os.path.isdir(new_abspath),
                'path': self.path_to_relpath(new_abspath),
            }
        }


def includeme(config):
    config.add_route('files', '/api/0/files')
    config.add_route('all_files', '/api/0/files/all')
    config.add_route('source', '/api/0/files/source')
    config.add_route('rename', '/api/0/files/rename')
    config.add_route('create_folder', '/api/0/files/folder')
    config.scan(__name__)
