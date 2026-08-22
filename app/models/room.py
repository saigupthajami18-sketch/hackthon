"""
PlacementOps AI — Room Model (§6.15)
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Uuid as UUID
JSONB = JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.college_id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    location = Column(String(255), nullable=True)
    capacity = Column(Integer, nullable=True)
    availability_slots = Column(JSONB, nullable=True)  # [{start, end}]

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    college = relationship("College", back_populates="rooms")
    interview_slots = relationship("InterviewSlot", back_populates="room")
