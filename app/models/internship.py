"""
PlacementOps AI — Internship Model (§6.6)
"""

from sqlalchemy import Column, String, Date, DateTime, Text, Enum as SAEnum, ForeignKey, JSON, Uuid as UUID
JSONB = JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import ConversionStatus


class Internship(Base):
    __tablename__ = "internships"

    internship_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    responsibilities = Column(Text, nullable=True)
    technologies = Column(JSONB, nullable=True)
    certificate_url = Column(String(500), nullable=True)
    conversion_status = Column(
        SAEnum(ConversionStatus, name="conversion_status", create_constraint=True),
        default=ConversionStatus.NONE,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="internships")
