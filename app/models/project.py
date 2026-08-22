"""
PlacementOps AI — Project Model (§6.5)
"""

from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON, Uuid as UUID
JSONB = JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    role_in_project = Column(String(100), nullable=True)
    technologies = Column(JSONB, nullable=True)  # ["React", "Node.js", "MongoDB"]
    github_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    duration_months = Column(Integer, nullable=True)
    team_size = Column(Integer, nullable=True)
    evidence_files = Column(JSONB, nullable=True)  # [S3 URLs]

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="projects")
