from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    Table,
    Text,
)

from sqlalchemy.orm import relationship

from .meta import Base


user_role_table = Table(
    'user_role', Base.metadata,
    Column('user_id', Integer, ForeignKey('user.user_id')),
    Column('role_id', Integer, ForeignKey('role.role_id'))
)



class User(Base):
    __tablename__ = 'user'
    user_id = Column(Integer, primary_key=True)
    login = Column(Text)
    password = Column(Text)
    name = Column(Text)
    email = Column(Text)

    roles = relationship("Role",
                         secondary=user_role_table,
                         backref="users")

    def get_commit_author(self):
        return '%s <%s>' % (self.name, self.email)


class Role(Base):
    __tablename__ = 'role'
    role_id = Column(Integer, primary_key=True)
    name = Column(Text)
