from pyramid.httpexceptions import HTTPForbidden
from pyramid.security import (
    remember,
    forget,
    )

from pyramid.view import (
    view_config,
    view_defaults
    )

from  ..models import User

from .security import (
    check_password,
)

from pyramid.response import Response


@view_config(context=HTTPForbidden, renderer='json')
def forbidden_view(exc, request):
    request.response.status_int = (
        401 if request.unauthenticated_userid else 403)
    return {}


@view_defaults(renderer='json')
class AuthView(object):

    def __init__(self, request):
        self.request = request

    def get_user_response(self, user):
        return {
            'username': user.name,
            'roles': [r.name for r in user.roles],
        }

    @view_config(route_name='login', request_method='GET',
                 permission='authenticated')
    def get(self):
        user = self.request.dbsession.query(User).get(
            self.request.authenticated_userid)
        return self.get_user_response(user)

    # TODO: only add this view in debug
    @view_config(route_name='logout', request_method='OPTIONS')
    @view_config(route_name='login', request_method='OPTIONS')
    def options(self):
        return {}

    @view_config(route_name='login', request_method='POST')
    def login(self):
        username = self.request.json_body.get('username')
        password = self.request.json_body.get('password')
        if not username or not password:
            self.request.response.status_code = 400
            return {}

        user = self.request.dbsession.query(User).filter_by(login=username).one_or_none()
        if not user:
            self.request.response.status_code = 400
            return {}

        if check_password(password, user.password):
            headers = remember(self.request, user.user_id)
            self.request.response.headerlist.extend(headers)
            return self.get_user_response(user)

        self.request.response.status_code = 400
        return {}

    @view_config(route_name='logout', request_method='POST')
    def logout(self):
        headers = forget(self.request)
        self.request.response.headerlist.extend(headers)
        return {}


def includeme(config):
    config.add_route('login', '/api/0/auth/login')
    config.add_route('logout', '/api/0/auth/logout')
