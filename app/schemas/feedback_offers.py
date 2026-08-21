from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models import FeedbackDecision, ApplicationStatus, OfferStatus

class FeedbackCreate(BaseModel):
    remarks: str
    decision: FeedbackDecision

class FeedbackResponse(BaseModel):
    feedback_id: UUID
    application_id: UUID
    slot_id: UUID
    panel_id: UUID
    remarks: str
    decision: FeedbackDecision
    submitted_by: UUID
    submitted_at: datetime

    class Config:
        from_attributes = True

class ApplicationDecisionRequest(BaseModel):
    decision: ApplicationStatus  # expecting SELECTED, REJECTED, or WAITLISTED

class OfferCreate(BaseModel):
    offer_letter_url: Optional[str] = None
    ctc_offered: Optional[str] = None

class OfferStatusUpdate(BaseModel):
    status: OfferStatus  # expecting ACCEPTED or DECLINED

class OfferResponse(BaseModel):
    offer_id: UUID
    application_id: UUID
    offer_letter_url: Optional[str] = None
    ctc_offered: Optional[str] = None
    issued_at: datetime
    status: OfferStatus
    responded_at: Optional[datetime] = None

    class Config:
        from_attributes = True
