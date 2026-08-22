"""
PlacementOps AI — College Model (§6.9)
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Uuid as UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base


class College(Base):
    __tablename__ = "colleges"

    college_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=True)
    accreditation_info = Column(String(255), nullable=True)
    domain = Column(String(100), nullable=True)  # Email domain for auto-verification

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    students = relationship("Student", back_populates="college")
    partnerships = relationship("CollegeCompanyPartnership", back_populates="college")
    rooms = relationship("Room", back_populates="college")
    drives = relationship("JobDrive", back_populates="college")
