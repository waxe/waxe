from git import Repo
from pyramid.view import view_config, view_defaults

from . import helper


@view_defaults(renderer='json')
class GitView(object):

    def __init__(self, request):
        self.request = request
        self.root_path = self.request.registry.settings['root_path']

    @view_config(route_name='status', request_method='GET')
    def status(self):
        repo = Repo(self.root_path)
        return {
            'status': helper.git_status(repo)
        }

    @view_config(route_name='pull', request_method='GET')
    def pull(self):
        repo = Repo(self.root_path)

        file_status = helper.git_pull(repo)

        if not file_status:
            return {
                'msg': 'The repo was already up to date.'
            }

        return {
            'msg': 'List of files modified since your last update:',
            'status': file_status,
        }

    @view_config(route_name='commit', request_method='POST')
    def commit(self):
        repo = Repo(self.root_path)
        # TODO: paths validation
        paths = self.request.json_body.get('paths') or []
        helper.git_commit(repo, paths)
        return {}


def includeme(config):
    config.add_route('status', '/api/0/versioning')
    config.add_route('pull', '/api/0/versioning/pull')
    config.add_route('commit', '/api/0/versioning/commit')
