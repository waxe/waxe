import bcrypt
import ldap
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid_ldap import (
    get_ldap_connector,
    groupfinder as ldap_groupfinder,
)

from pyramid.security import (
    Everyone,
    Allow,
    Authenticated
)

from ..models import Role
from ..models.user import User


class RootFactory(object):
    __acl__ = [
        (Allow, Authenticated, 'authenticated'),
        (Allow, 'role:edit', ['edit']),
        (Allow, 'cn=waxe_admin,ou=waxe_groups,dc=a9english,dc=com', ['edit']),
    ]

    def __init__(self, request):
        pass


def _ldap_groupfinder(user_id, request):
    user = request.dbsession.query(User).get(user_id)
    return ldap_groupfinder(user.login, request)


def hash_password(pw):
    pwhash = bcrypt.hashpw(pw.encode('utf8'), bcrypt.gensalt())
    return pwhash.decode('utf8')


def check_password(pw, hashed_pw):
    expected_hash = hashed_pw.encode('utf8')
    return bcrypt.checkpw(pw.encode('utf8'), expected_hash)


def groupfinder(userid, request):
    user = request.dbsession.query(User).get(userid)
    return ['role:%s' % r.name for r in user.roles]


def load_db_auth(config, settings):
    authn_policy = AuthTktAuthenticationPolicy(
        settings['auth.secret'], callback=groupfinder,
        hashalg='sha512')
    authz_policy = ACLAuthorizationPolicy()
    config.set_authentication_policy(authn_policy)
    config.set_authorization_policy(authz_policy)


def load_ldap_auth(config, settings):
    config.include('pyramid_ldap')

    # https://github.com/Pylons/pyramid_ldap/issues/26
    config.set_request_property = config.add_request_method
    config.set_authentication_policy(
        AuthTktAuthenticationPolicy(settings['auth.secret'],
                                    callback=_ldap_groupfinder)
        )
    config.set_authorization_policy(
        ACLAuthorizationPolicy()
        )

    config.ldap_setup(
        settings['ldap.setup.uri'],
    )

    config.ldap_set_login_query(
        base_dn=settings['ldap.login.base_dn'],
        filter_tmpl=settings['ldap.login.filter_tmpl'].replace(
            '$login', '%(login)s'),
        scope=getattr(ldap, settings['ldap.login.scope']),
    )

    config.ldap_set_groups_query(
        base_dn=settings['ldap.groups.base_dn'],
        filter_tmpl=settings['ldap.groups.filter_tmpl'].replace(
            '$userdn', '%(userdn)s'),
        scope=getattr(ldap, settings['ldap.groups.scope']),
        cache_period=int(settings['ldap.groups.cache_period']),
    )


def get_or_create_role(role_name, request):
    role = request.dbsession.query(Role).filter_by(name=role_name).one_or_none()
    if not role:
        role = Role(name=role_name)
    return role


def check_user(request, username, password):
    if request.registry.settings.get('ldap.setup.uri'):
        connector = get_ldap_connector(request)
        data = connector.authenticate(username, password)
        if not data:
            return None
        # TODO: we need to create a function for this in the conf
        uid = data[1]['uid'][0]
        name = data[1]['displayname'][0]
        email = data[1]['maillocaladdress'][0]

        user = request.dbsession.query(User).filter_by(
            login=uid).one_or_none()
        if not user:
            # TODO: get more data from the ldap
            user = User(login=uid, name=name, email=email, is_ldap_user=True)
            request.dbsession.add(user)
            user = request.dbsession.query(User).filter_by(login=uid).one()

        # Be sure the ldap roles are up to date
        user.roles = [get_or_create_role(r, request)
                      for r in ldap_groupfinder(uid, request)]

        return user

    user = request.dbsession.query(User).filter_by(
        login=username).one_or_none()
    if not user:
        return None

    if not check_password(password, user.password):
        return None
    return user


def includeme(config):
    settings = config.get_settings()
    if settings.get('ldap.setup.uri'):
        load_ldap_auth(config, settings)
    else:
        load_db_auth(config, settings)
