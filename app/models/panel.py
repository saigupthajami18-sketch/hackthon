"""
PlacementOps AI — Panel & Room Models (§6.14, §6.15)
"""

from sqlalchemy import Column, String, DateTime, Enum as SAEnum, ForeignKey, JSON, Uuid as UUID
JSONB = JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import PanelMemberType


class Panel(Base):
    __tablename__ = "panels"

    panel_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    drive_id = Column(UUID(as_uuid=True), ForeignKey("job_drives.drive_id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    member_type = Column(SAEnum(PanelMemberType, name="panel_member_type", create_constraint=True), nullable=False)
    members = Column(JSONB, nullable=False)  # [{user_id, name, role}]
    availability_slots = Column(JSONB, nullable=True)  # [{start, end}]

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    drive = relationship("JobDrive", back_populates="panels")
    interview_slots = relationship("InterviewSlot", back_populates="panel")
    feedbacks = relationship("Feedback", back_populates="panel")



