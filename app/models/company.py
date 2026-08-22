"""
PlacementOps AI — Company & Partnership Models (§6.10, §6.11)
"""

from sqlalchemy import Column, String, Text, DateTime, Enum as SAEnum, ForeignKey, JSON, Uuid as UUID
JSONB = JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import VerificationStatus, PartnershipStatus


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    logo_url = Column(String(500), nullable=True)
    industry = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    recruiter_contacts = Column(JSONB, nullable=True)  # [{name, email, phone}]
    locations = Column(JSONB, nullable=True)
    verification_status = Column(
        SAEnum(VerificationStatus, name="verification_status", create_constraint=True),
        default=VerificationStatus.PENDING,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    partnerships = relationship("CollegeCompanyPartnership", back_populates="company")
    drives = relationship("JobDrive", back_populates="company")


class CollegeCompanyPartnership(Base):
    __tablename__ = "college_company_partnerships"

    partnership_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.college_id", ondelete="CASCADE"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.company_id", ondelete="CASCADE"), nullable=False)
    status = Column(
        SAEnum(PartnershipStatus, name="partnership_status", create_constraint=True),
        default=PartnershipStatus.REQUESTED,
    )
    started_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    college = relationship("College", back_populates="partnerships")
    company = relationship("Company", back_populates="partnerships")
