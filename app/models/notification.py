"""
PlacementOps AI — Notification Model (§6.19)
"""

from sqlalchemy import Column, String, Text, DateTime, Enum as SAEnum, ForeignKey, Uuid as UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import NotificationType, NotificationChannel, NotificationStatus


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    
    type = Column(SAEnum(NotificationType, name="notification_type", create_constraint=True), nullable=False)
    channel = Column(SAEnum(NotificationChannel, name="notification_channel", create_constraint=True), nullable=False)
    message = Column(Text, nullable=False)
    
    status = Column(SAEnum(NotificationStatus, name="notification_status", create_constraint=True), default=NotificationStatus.QUEUED)
    sent_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")
