import bcrypt
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.security import (
    Everyone,
    Allow,
    Authenticated
)

from ..models import User


class RootFactory(object):
    __acl__ = [
        (Allow, Authenticated, 'authenticated'),
        (Allow, 'role:edit', ['edit']),
    ]

    def __init__(self, request):
        pass


def hash_password(pw):
    pwhash = bcrypt.hashpw(pw.encode('utf8'), bcrypt.gensalt())
    return pwhash.decode('utf8')


def check_password(pw, hashed_pw):
    expected_hash = hashed_pw.encode('utf8')
    return bcrypt.checkpw(pw.encode('utf8'), expected_hash)


def groupfinder(userid, request):
    user = request.dbsession.query(User).get(userid)
    return ['role:%s' % r.name for r in user.roles]


def includeme(config):
    settings = config.get_settings()
    authn_policy = AuthTktAuthenticationPolicy(
        settings['auth.secret'], callback=groupfinder,
        hashalg='sha512')
    authz_policy = ACLAuthorizationPolicy()
    config.set_authentication_policy(authn_policy)
    config.set_authorization_policy(authz_policy)
