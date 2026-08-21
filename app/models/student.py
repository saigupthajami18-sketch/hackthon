"""
PlacementOps AI — Student, Skill, SkillTaxonomy Models (§6.2, §6.3, §6.4)
"""

from sqlalchemy import (
    Column, String, Integer, Numeric, DateTime, Text,
    Enum as SAEnum, ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import SkillProficiency, EvidenceSource


class Student(Base):
    __tablename__ = "students"

    student_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    roll_no = Column(String(50), nullable=False)
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.college_id", ondelete="CASCADE"), nullable=False)
    department = Column(String(100), nullable=True)
    branch = Column(String(100), nullable=False)
    batch = Column(String(20), nullable=True)
    graduation_year = Column(Integer, nullable=False)
    photo_url = Column(String(500), nullable=True)

    # Academic
    cgpa = Column(Numeric(4, 2), nullable=True)
    semester_gpas = Column(JSONB, nullable=True)  # [{semester: int, gpa: float}]
    subjects = Column(JSONB, nullable=True)        # [{name, marks, semester}]
    active_backlogs = Column(Integer, default=0)
    total_backlogs_history = Column(Integer, default=0)
    attendance_pct = Column(Numeric(5, 2), nullable=True)

    # Derived
    readiness_score = Column(Numeric(5, 2), nullable=True)  # Computed by Analytics Agent

    # Embedding for matching (pgvector)
    # skill_embedding = Column(Vector(768), nullable=True)  # Uncomment when pgvector extension is enabled

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Unique constraint: roll_no per college
    __table_args__ = (
        # UniqueConstraint("roll_no", "college_id", name="uq_student_roll_college"),
    )

    # Relationships
    user = relationship("User", back_populates="student")
    college = relationship("College", back_populates="students")
    skills = relationship("Skill", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    internships = relationship("Internship", back_populates="student", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="student", cascade="all, delete-orphan")
    coding_profiles = relationship("CodingProfile", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")


class SkillTaxonomy(Base):
    """Normalization reference table for skill names (§6.4)."""
    __tablename__ = "skill_taxonomy"

    skill_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    canonical_name = Column(String(100), unique=True, nullable=False, index=True)
    aliases = Column(JSONB, nullable=True)  # ["JS", "Javascript", "ES6"]
    category = Column(String(50), nullable=True)  # Language, Framework, Tool, Soft Skill

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Skill(Base):
    """Student's individual skill entry (§6.3)."""
    __tablename__ = "skills"

    skill_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)  # Normalized against SkillTaxonomy
    category = Column(String(50), nullable=True)
    proficiency = Column(SAEnum(SkillProficiency, name="skill_proficiency", create_constraint=True), nullable=True)
    evidence_source = Column(SAEnum(EvidenceSource, name="evidence_source", create_constraint=True), nullable=True)
    months_experience = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="skills")
