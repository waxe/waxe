from sqlalchemy import (
    Column,
    Integer,
    Text,
)

from .meta import Base


class User(Base):
    __tablename__ = 'user'
    user_id = Column(Integer, primary_key=True)
    login = Column(Text)
    password = Column(Text)
    name = Column(Text)
    email = Column(Text)
