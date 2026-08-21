"""
PlacementOps AI — User Model (§6.1)
Base auth table for all three roles.
"""

from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum as SAEnum, ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import UserRole


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    role = Column(SAEnum(UserRole, name="user_role", create_constraint=True), nullable=False)
    org_id = Column(UUID(as_uuid=True), nullable=True)  # FK to College or Company depending on role
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
