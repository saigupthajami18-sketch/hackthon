from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class PlacementFunnelResponse(BaseModel):
    total_applied: int
    eligible: int
    matched: int
    shortlisted: int
    interview_scheduled: int
    selected: int
    offer_accepted: int

class ReadinessReportResponse(BaseModel):
    student_id: UUID
    readiness_score: float
    strengths: list[str]
    improvement_areas: list[str]

class AuditLogCreate(BaseModel):
    actor_id: Optional[UUID] = None
    actor_type: str
    action_type: str
    entity_type: str
    entity_id: str
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None

class AuditLogResponse(BaseModel):
    log_id: UUID
    actor_id: Optional[UUID] = None
    actor_type: str
    action_type: str
    entity_type: str
    entity_id: str
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
