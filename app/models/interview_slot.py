"""
PlacementOps AI — InterviewSlot Model (§6.16)
"""

from sqlalchemy import Column, String, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import InterviewMode, InterviewRound, SlotStatus, SlotGenerator


class InterviewSlot(Base):
    __tablename__ = "interview_slots"

    slot_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    drive_id = Column(UUID(as_uuid=True), ForeignKey("job_drives.drive_id", ondelete="CASCADE"), nullable=False)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.application_id", ondelete="CASCADE"), nullable=False)
    panel_id = Column(UUID(as_uuid=True), ForeignKey("panels.panel_id", ondelete="CASCADE"), nullable=False)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.room_id", ondelete="SET NULL"), nullable=True)
    
    mode = Column(SAEnum(InterviewMode, name="interview_mode", create_constraint=True), nullable=False)
    meeting_link = Column(String(500), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    round = Column(SAEnum(InterviewRound, name="interview_round", create_constraint=True), nullable=False)
    
    status = Column(SAEnum(SlotStatus, name="slot_status", create_constraint=True), default=SlotStatus.DRAFT)
    generated_by = Column(SAEnum(SlotGenerator, name="slot_generator", create_constraint=True), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    application = relationship("Application", back_populates="interview_slots")
    panel = relationship("Panel", back_populates="interview_slots")
    room = relationship("Room", back_populates="interview_slots")
    feedbacks = relationship("Feedback", back_populates="slot", cascade="all, delete-orphan")
