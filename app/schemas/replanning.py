from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class RescheduleRequest(BaseModel):
    reason: str
    preferred_start: Optional[datetime] = None
    preferred_end: Optional[datetime] = None

class ReplanDiffResponse(BaseModel):
    slot_id: UUID
    old_start_time: datetime
    old_end_time: datetime
    old_panel_id: UUID
    new_start_time: datetime
    new_end_time: datetime
    new_panel_id: UUID
    reason: str
    message: str
