"""
PlacementOps AI — Application Model (§6.13)
"""

from sqlalchemy import Column, String, Numeric, Text, DateTime, Enum as SAEnum, ForeignKey, JSON, Uuid as UUID, UniqueConstraint
JSONB = JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import EligibilityStatus, ShortlistStatus, ApplicationStatus


class Application(Base):
    __tablename__ = "applications"

    application_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    drive_id = Column(UUID(as_uuid=True), ForeignKey("job_drives.drive_id", ondelete="CASCADE"), nullable=False)
    
    eligibility_status = Column(
        SAEnum(EligibilityStatus, name="eligibility_status", create_constraint=True),
        default=EligibilityStatus.PENDING,
    )
    eligibility_reason = Column(Text, nullable=True)
    
    match_score = Column(Numeric(5, 2), nullable=True)
    match_explanation = Column(Text, nullable=True)
    skill_gap = Column(JSONB, nullable=True)
    
    shortlist_status = Column(
        SAEnum(ShortlistStatus, name="shortlist_status", create_constraint=True),
        default=ShortlistStatus.NOT_SHORTLISTED,
    )
    application_status = Column(
        SAEnum(ApplicationStatus, name="application_status", create_constraint=True),
        default=ApplicationStatus.APPLIED,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("student_id", "drive_id", name="uq_student_drive_application"),
    )

    # Relationships
    student = relationship("Student", back_populates="applications")
    drive = relationship("JobDrive", back_populates="applications")
    interview_slots = relationship("InterviewSlot", back_populates="application", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="application", cascade="all, delete-orphan")
