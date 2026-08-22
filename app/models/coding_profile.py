"""
PlacementOps AI — CodingProfile Model (§6.8)
"""

from sqlalchemy import Column, String, Integer, DateTime, Enum as SAEnum, ForeignKey, Uuid as UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import CodingPlatform, DataSource


class CodingProfile(Base):
    __tablename__ = "coding_profiles"

    profile_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    platform = Column(SAEnum(CodingPlatform, name="coding_platform", create_constraint=True), nullable=False)
    username = Column(String(100), nullable=False)
    profile_url = Column(String(500), nullable=True)
    rating = Column(Integer, nullable=True)
    problems_solved = Column(Integer, nullable=True)
    contests_count = Column(Integer, nullable=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    data_source = Column(
        SAEnum(DataSource, name="data_source", create_constraint=True),
        default=DataSource.MANUAL_ENTRY,
        nullable=False,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="coding_profiles")
