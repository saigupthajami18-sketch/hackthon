from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List

from app.database import get_db
from app.models.job_drive import JobDrive
from app.models.interview_slot import InterviewSlot
from app.models import UserRole, SlotStatus, DriveStatus
from app.schemas.auth import TokenData
from app.services.auth_service import get_current_user
from app.middleware.rbac import require_roles
from app.middleware.org_scope import verify_org_access
from app.schemas.scheduling import (
    ScheduleGenerateRequest,
    ScheduleGenerateResponse,
    ScheduleDraftResponse,
    InterviewSlotResponse
)
from app.services.scheduling_service import generate_schedule

router = APIRouter(prefix="/drives", tags=["Scheduling"])

@router.post("/{drive_id}/schedule/generate", response_model=ScheduleGenerateResponse)
async def generate_drive_schedule(
    drive_id: str,
    request: ScheduleGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(drive.college_id, current_user)
    
    try:
        result = await generate_schedule(db, drive_id, request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{drive_id}/schedule/draft", response_model=ScheduleDraftResponse)
async def get_schedule_draft(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(drive.company_id if current_user.role == UserRole.COMPANY_RECRUITER else drive.college_id, current_user)
    
    stmt = select(InterviewSlot).where(
        InterviewSlot.drive_id == uuid.UUID(drive_id),
        InterviewSlot.status == SlotStatus.DRAFT
    )
    result = await db.execute(stmt)
    slots = result.scalars().all()
    
    return ScheduleDraftResponse(slots=slots)

@router.post("/{drive_id}/schedule/confirm")
async def confirm_schedule(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(drive.college_id, current_user)
    
    stmt = select(InterviewSlot).where(
        InterviewSlot.drive_id == uuid.UUID(drive_id),
        InterviewSlot.status == SlotStatus.DRAFT
    )
    result = await db.execute(stmt)
    slots = result.scalars().all()
    
    if not slots:
        raise HTTPException(status_code=400, detail="No draft slots to confirm")
        
    for slot in slots:
        slot.status = SlotStatus.CONFIRMED
        
    drive.status = DriveStatus.SCHEDULE_CONFIRMED
    await db.commit()
    
    return {"message": f"Confirmed {len(slots)} slots"}

from app.schemas.replanning import RescheduleRequest, ReplanDiffResponse
from app.services.replanning_service import generate_minimal_replan

@router.post("/interview-slots/{slot_id}/reschedule", response_model=ReplanDiffResponse)
async def reschedule_slot(
    slot_id: str,
    request: RescheduleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    slot = await db.get(InterviewSlot, uuid.UUID(slot_id))
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
        
    try:
        result = await generate_minimal_replan(db, slot_id, request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
