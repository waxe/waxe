from pyramid.httpexceptions import HTTPForbidden
from pyramid.security import (
    remember,
    forget,
    )

from pyramid.view import (
    view_config,
    view_defaults
    )

from .security import (
    USERS,
    check_password,
    get_roles,
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

    def get_user_response(self, userid):
        return {
            'username': userid,
            'roles': get_roles(userid),
        }

    @view_config(route_name='login', request_method='GET',
                 permission='authenticated')
    def get(self):
        return self.get_user_response(self.request.authenticated_userid)

    # TODO: only add this view in debug
    @view_config(route_name='logout', request_method='OPTIONS')
    @view_config(route_name='login', request_method='OPTIONS')
    def options(self):
        {}

    @view_config(route_name='login', request_method='POST')
    def login(self):
        username = self.request.json_body.get('username')
        password = self.request.json_body.get('password')
        if not username or not password:
            self.request.response.status_code = 400
            return {}

        hashed_pw = USERS.get(username)
        if hashed_pw and check_password(password, hashed_pw):
            headers = remember(self.request, username)
            self.request.response.headerlist.extend(headers)
            return self.get_user_response(username)

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
