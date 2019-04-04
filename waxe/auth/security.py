import bcrypt
from pyramid.security import (
    Everyone,
    Allow,
    Authenticated
)


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


USERS = {
    'editor': hash_password('editor'),
    'viewer': hash_password('viewer')
}

ROLES = {
    'editor': ['role:edit'],
}


def groupfinder(userid, request):
    return ROLES.get(userid, [])


def get_roles(userid):
    if userid in USERS:
        roles = ROLES.get(userid, [])
        return [role.split(':')[-1] for role in roles]
