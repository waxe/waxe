import pyramid.httpexceptions as exc
from pyramid.view import view_defaults

from ..files import (
    absolute_path,
    cleanup_path,
    relative_path,
)


@view_defaults(renderer='json', permission='edit')
class BaseView(object):

    def __init__(self, request):
        self.request = request
        self.root_path = self.request.registry.settings['root_path']

    def path_to_relpath(self, path):
        """Transform the given path in relative path
        """
        return relative_path(self.root_path, path)

    def remove_abspath(self, s):
        """In the error message we don't want to display the absolute path
        """
        return cleanup_path(self.root_path, s)


class BaseGetView(BaseView):

    def __init__(self, request):
        super(BaseGetView, self).__init__(request)
        path = self.request.GET.get('path', '')
        try:
            self.abspath = absolute_path(self.root_path, path)
        except IOError:
            raise exc.HTTPNotFound()
        self.relpath = path


class BasePostView(BaseView):

    def __init__(self, request):
        super(BasePostView, self).__init__(request)
        path = self.request.json_body.get('path') or ''
        try:
            self.abspath = absolute_path(self.root_path, path)
        except IOError:
            raise exc.HTTPNotFound()
        self.relpath = path
