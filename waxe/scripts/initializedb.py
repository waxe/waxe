import os
import sys
import transaction

from pyramid.paster import (
    get_appsettings,
    setup_logging,
    )

from pyramid.scripts.common import parse_vars

from ..models.meta import Base
from ..models import (
    get_engine,
    get_session_factory,
    get_tm_session,
    )
from ..models import Role, User

from ..auth.security import hash_password


def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri> [var=value]\n'
          '(example: "%s development.ini")' % (cmd, cmd))
    sys.exit(1)


USERS = [
    ('editor', 'editor', 'Editor', 'editor@lereskp.fr'),
]

ROLES = [
    'edit'
]


def main(argv=sys.argv):
    if len(argv) < 2:
        usage(argv)
    config_uri = argv[1]
    options = parse_vars(argv[2:])
    setup_logging(config_uri)
    settings = get_appsettings(config_uri, options=options)

    engine = get_engine(settings)
    Base.metadata.create_all(engine)

    session_factory = get_session_factory(engine)

    with transaction.manager:
        dbsession = get_tm_session(session_factory, transaction.manager)

        for role_name in ROLES:
            role = Role(name=role_name)
            dbsession.add(role)

        role = dbsession.query(Role).filter_by(name=ROLES[0]).one()

        for login, password, name, email in USERS:
            user = User(login=login, password=hash_password(password), name=name, email=email)
            user.roles = [role]
        dbsession.add(user)
