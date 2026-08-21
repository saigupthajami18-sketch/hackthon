from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.models import InterviewMode, InterviewRound, SlotStatus

class ScheduleGenerateRequest(BaseModel):
    # Optional parameters to constrain the scheduling logic
    interview_duration_minutes: int = 30
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    interview_round: InterviewRound = InterviewRound.TECHNICAL_1
    mode: InterviewMode = InterviewMode.ONLINE

class InterviewSlotResponse(BaseModel):
    slot_id: UUID
    drive_id: UUID
    application_id: UUID
    panel_id: UUID
    room_id: Optional[UUID] = None
    mode: InterviewMode
    meeting_link: Optional[str] = None
    start_time: datetime
    end_time: datetime
    round: InterviewRound
    status: SlotStatus

    class Config:
        from_attributes = True

class ScheduleDraftResponse(BaseModel):
    slots: List[InterviewSlotResponse]

class UnscheduledCandidate(BaseModel):
    application_id: UUID
    reason: str

class ScheduleGenerateResponse(BaseModel):
    message: str
    scheduled_count: int
    unscheduled_candidates: List[UnscheduledCandidate]
