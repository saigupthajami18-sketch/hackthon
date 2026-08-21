"""
PlacementOps AI — JobDrive Model (§6.12)
"""

from sqlalchemy import Column, String, Text, Integer, Numeric, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import EmploymentType, ExtractionStatus, DriveStatus


class JobDrive(Base):
    __tablename__ = "job_drives"

    drive_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.company_id", ondelete="CASCADE"), nullable=False)
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.college_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    raw_jd_text = Column(Text, nullable=True)
    raw_jd_file_url = Column(String(500), nullable=True)
    employment_type = Column(SAEnum(EmploymentType, name="employment_type", create_constraint=True), nullable=True)
    ctc_min = Column(Numeric(12, 2), nullable=True)
    ctc_max = Column(Numeric(12, 2), nullable=True)
    locations = Column(JSONB, nullable=True)

    # AI-extracted structured fields
    extracted_jd_json = Column(JSONB, nullable=True)
    extraction_confidence = Column(Numeric(5, 4), nullable=True)
    extraction_status = Column(
        SAEnum(ExtractionStatus, name="extraction_status", create_constraint=True),
        default=ExtractionStatus.PENDING,
    )

    # Eligibility criteria (confirmed version)
    eligibility_branches = Column(JSONB, nullable=True)
    eligibility_min_cgpa = Column(Numeric(4, 2), nullable=True)
    eligibility_max_backlogs = Column(Integer, nullable=True)
    eligibility_grad_years = Column(JSONB, nullable=True)
    required_skills = Column(JSONB, nullable=True)
    preferred_skills = Column(JSONB, nullable=True)

    application_deadline = Column(DateTime(timezone=True), nullable=True)
    drive_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(
        SAEnum(DriveStatus, name="drive_status", create_constraint=True),
        default=DriveStatus.DRAFT,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="drives")
    college = relationship("College", back_populates="drives")
    applications = relationship("Application", back_populates="drive", cascade="all, delete-orphan")
    panels = relationship("Panel", back_populates="drive", cascade="all, delete-orphan")
