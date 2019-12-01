from pyramid.config import Configurator
from pyramid.events import NewRequest
from pyramid.view import view_config

from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy

from git import GitCommandError

from auth.security import RootFactory


# Allow cross origin in dev
# TODO: be strict
def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        response.headers.update({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '1728000',
        })
    event.request.add_response_callback(cors_headers)


@view_config(context=Exception, renderer='json')
def exception_view(context, request):
    if isinstance(context, GitCommandError):
        msg = context.stderr
    else:
        msg = unicode(context)

    msg = msg if msg else 'An error occured please contact administrator'
    request.response.status = 500
    return {'error': msg}


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings, root_factory=RootFactory)
    config.include('.auth.security')
    config.include('pyramid_jinja2')
    config.include('.models')
    config.include('.routes')
    config.include('.filemanager.views.default')
    config.include('.filemanager.views.po')
    config.include('.versioning.views')
    config.include('.auth.views')
    config.add_subscriber(add_cors_headers_response_callback, NewRequest)
    config.scan()
    return config.make_wsgi_app()
