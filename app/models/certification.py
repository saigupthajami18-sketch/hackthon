"""
PlacementOps AI — Certification Model (§6.7)
"""

from sqlalchemy import Column, String, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base


class Certification(Base):
    __tablename__ = "certifications"

    cert_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    credential_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="certifications")
