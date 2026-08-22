"""
PlacementOps AI — AuditLog Model (§6.20)
"""

from sqlalchemy import Column, String, Text, DateTime, Enum as SAEnum, ForeignKey, JSON, Uuid as UUID
JSONB = JSON
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import ActorType


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    actor_type = Column(SAEnum(ActorType, name="actor_type", create_constraint=True), nullable=False)
    
    action_type = Column(String(100), nullable=False)  # e.g., "eligibility_override"
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(255), nullable=False)
    
    before_state = Column(JSONB, nullable=True)
    after_state = Column(JSONB, nullable=True)
    reason = Column(Text, nullable=True)  # Required for overrides
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
