import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
import enum
from app.db.session import Base

class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
