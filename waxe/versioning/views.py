from git import GitCommandError, Repo
from pyramid.view import view_config, view_defaults

from . import helper


@view_defaults(renderer='json', permission='edit')
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

    @view_config(route_name='branches', request_method='GET')
    def branches(self):
        repo = Repo(self.root_path)
        current_branch = helper.get_current_branch(repo)
        return {
            'branches': [b.name for b in repo.branches],
            'current': current_branch.name if current_branch else None,
        }

    @view_config(route_name='branches', request_method='POST')
    def switch_branch(self):
        repo = Repo(self.root_path)
        branch_name = self.request.json_body.get('branch')
        if not branch_name:
            self.request.response.status = 400
            return {'error': "No branch given"}

        try:
            branch = next(b for b in repo.branches if b.name == branch_name)
        except StopIteration:
            self.request.response.status = 400
            return {'error': "The branch %s doesn't exists" % branch_name}

        if helper.git_status(repo):
            self.request.response.status = 400
            return {'error': 'Commit your changes before switching branch'}

        try:
            branch.checkout()
        except GitCommandError, exc:
            self.request.response.status = 400
            return {'error': unicode(exc.stderr)}
        return {}

    @view_config(route_name='pull', request_method='GET')
    def pull(self):
        repo = Repo(self.root_path)
        file_statuses = helper.update_repo(repo)

        if not file_statuses:
            return {
                'msg': 'The repo was already up to date.'
            }

        return {
            'msg': 'List of files modified since your last update:',
            'status': file_statuses,
        }

    @view_config(route_name='commit', request_method='POST')
    def commit(self):
        repo = Repo(self.root_path)
        # TODO: paths validation
        paths = self.request.json_body.get('paths') or []
        message = self.request.json_body.get('message')
        author = self.request.user.get_commit_author()
        helper.git_commit(repo, paths, author=author, message=message)
        return {}

    @view_config(route_name='check', request_method='GET')
    def check(self):
        repo = Repo(self.root_path)
        return helper.check_repo(repo)


def includeme(config):
    config.add_route('status', '/api/0/versioning')
    config.add_route('branches', '/api/0/versioning/branches')
    config.add_route('pull', '/api/0/versioning/pull')
    config.add_route('commit', '/api/0/versioning/commit')
    config.add_route('check', '/api/0/versioning/check')
