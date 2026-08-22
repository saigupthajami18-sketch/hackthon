"""
PlacementOps AI — Feedback Model (§6.17)
"""

from sqlalchemy import Column, Text, DateTime, Enum as SAEnum, ForeignKey, Uuid as UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import FeedbackDecision


class Feedback(Base):
    __tablename__ = "feedbacks"

    feedback_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.application_id", ondelete="CASCADE"), nullable=False)
    slot_id = Column(UUID(as_uuid=True), ForeignKey("interview_slots.slot_id", ondelete="CASCADE"), nullable=False)
    panel_id = Column(UUID(as_uuid=True), ForeignKey("panels.panel_id", ondelete="CASCADE"), nullable=False)
    
    remarks = Column(Text, nullable=True)
    decision = Column(SAEnum(FeedbackDecision, name="feedback_decision", create_constraint=True), nullable=False)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    slot = relationship("InterviewSlot", back_populates="feedbacks")
    panel = relationship("Panel", back_populates="feedbacks")
