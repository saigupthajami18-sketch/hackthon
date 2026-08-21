import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.feedback import Feedback
from app.models.application import Application
from app.models.offer import Offer
from app.models.interview_slot import InterviewSlot
from app.models import SlotStatus, ApplicationStatus, OfferStatus
from app.schemas.feedback_offers import FeedbackCreate, ApplicationDecisionRequest, OfferCreate, OfferStatusUpdate

async def submit_feedback(db: AsyncSession, slot_id: str, user_id: str, feedback_in: FeedbackCreate) -> Feedback:
    slot = await db.get(InterviewSlot, uuid.UUID(slot_id))
    if not slot:
        raise ValueError("Interview slot not found")
        
    feedback = Feedback(
        application_id=slot.application_id,
        slot_id=slot.slot_id,
        panel_id=slot.panel_id,
        remarks=feedback_in.remarks,
        decision=feedback_in.decision,
        submitted_by=uuid.UUID(user_id)
    )
    db.add(feedback)
    
    # Update slot status
    slot.status = SlotStatus.COMPLETED
    
    # Update application status
    application = await db.get(Application, slot.application_id)
    if application:
        application.application_status = ApplicationStatus.RESULT_PENDING
        
    await db.commit()
    await db.refresh(feedback)
    return feedback

async def make_decision(db: AsyncSession, application_id: str, decision_in: ApplicationDecisionRequest) -> Application:
    application = await db.get(Application, uuid.UUID(application_id))
    if not application:
        raise ValueError("Application not found")
        
    if decision_in.decision not in [ApplicationStatus.SELECTED, ApplicationStatus.REJECTED, ApplicationStatus.WAITLISTED]:
        raise ValueError("Invalid decision status")
        
    application.application_status = decision_in.decision
    await db.commit()
    await db.refresh(application)
    return application

async def issue_offer(db: AsyncSession, application_id: str, offer_in: OfferCreate) -> Offer:
    application = await db.get(Application, uuid.UUID(application_id))
    if not application:
        raise ValueError("Application not found")
        
    # Check if application is SELECTED
    if application.application_status != ApplicationStatus.SELECTED:
        raise ValueError("Cannot issue offer: candidate is not SELECTED")
        
    offer = Offer(
        application_id=application.application_id,
        offer_letter_url=offer_in.offer_letter_url,
        ctc_offered=offer_in.ctc_offered,
        status=OfferStatus.ISSUED
    )
    db.add(offer)
    
    application.application_status = ApplicationStatus.OFFER_ISSUED
    
    await db.commit()
    await db.refresh(offer)
    return offer

async def update_offer_status(db: AsyncSession, offer_id: str, status_update: OfferStatusUpdate) -> Offer:
    offer = await db.get(Offer, uuid.UUID(offer_id))
    if not offer:
        raise ValueError("Offer not found")
        
    if status_update.status not in [OfferStatus.ACCEPTED, OfferStatus.DECLINED]:
        raise ValueError("Status update must be ACCEPTED or DECLINED")
        
    offer.status = status_update.status
    offer.responded_at = datetime.utcnow()
    
    application = await db.get(Application, offer.application_id)
    if application:
        if status_update.status == OfferStatus.ACCEPTED:
            application.application_status = ApplicationStatus.OFFER_ACCEPTED
        else:
            application.application_status = ApplicationStatus.OFFER_DECLINED
            
    await db.commit()
    await db.refresh(offer)
    return offer
