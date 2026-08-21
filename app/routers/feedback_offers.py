from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List

from app.database import get_db
from app.models import UserRole
from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models.offer import Offer
from app.schemas.auth import TokenData
from app.services.auth_service import get_current_user
from app.middleware.rbac import require_roles
from app.middleware.org_scope import verify_org_access

from app.schemas.feedback_offers import (
    FeedbackCreate, FeedbackResponse,
    ApplicationDecisionRequest, 
    OfferCreate, OfferResponse, OfferStatusUpdate
)
from app.services.feedback_service import submit_feedback, make_decision, issue_offer, update_offer_status

router = APIRouter(tags=["Feedback & Offers"])

@router.post("/interview-slots/{slot_id}/feedback", response_model=FeedbackResponse)
async def create_feedback(
    slot_id: str,
    feedback_in: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COMPANY_RECRUITER, UserRole.COLLEGE_ADMIN]))
):
    try:
        feedback = await submit_feedback(db, slot_id, current_user.user_id, feedback_in)
        return feedback
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/applications/{application_id}/decision")
async def post_decision(
    application_id: str,
    decision_in: ApplicationDecisionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COMPANY_RECRUITER, UserRole.COLLEGE_ADMIN]))
):
    try:
        app = await make_decision(db, application_id, decision_in)
        return {"message": "Decision recorded successfully", "status": app.application_status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/applications/{application_id}/offer", response_model=OfferResponse)
async def post_offer(
    application_id: str,
    offer_in: OfferCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COMPANY_RECRUITER, UserRole.COLLEGE_ADMIN]))
):
    try:
        offer = await issue_offer(db, application_id, offer_in)
        return offer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/offers/{offer_id}/status", response_model=OfferResponse)
async def put_offer_status(
    offer_id: str,
    status_update: OfferStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    try:
        offer = await update_offer_status(db, offer_id, status_update)
        return offer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/drives/{drive_id}/offers", response_model=List[OfferResponse])
async def get_offers_by_drive(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COMPANY_RECRUITER, UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(drive.company_id if current_user.role == UserRole.COMPANY_RECRUITER else drive.college_id, current_user)
    
    stmt = select(Offer).join(Application).where(Application.drive_id == uuid.UUID(drive_id))
    result = await db.execute(stmt)
    offers = result.scalars().all()
    
    return offers
