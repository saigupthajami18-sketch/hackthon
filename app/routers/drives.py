"""
PlacementOps AI — Drives Router
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from typing import List

from app.database import get_db
from app.models.job_drive import JobDrive
from app.models import UserRole, ExtractionStatus
from app.schemas.auth import TokenData
from app.services.auth_service import get_current_user
from app.middleware.rbac import require_roles
from app.middleware.org_scope import apply_org_scope, verify_org_access
from app.services.drive_service import publish_drive
from app.agents.jd_analyst import extract_jd_data

router = APIRouter(prefix="/drives", tags=["Drives"])


async def run_jd_extraction_task(drive_id: str, raw_text: str):
    """Background task for JD extraction."""
    # Note: In a real implementation, we would acquire a fresh DB session here
    # Since this is a hackathon stub, we'll assume the session is handled inside or we create one.
    # For simplicity, we are just calling the agent here.
    try:
        from app.database import async_session
        
        result = extract_jd_data(raw_text)
        
        async with async_session() as db:
            drive = await db.get(JobDrive, uuid.UUID(drive_id))
            if drive:
                drive.extracted_jd_json = result
                drive.extraction_confidence = result.get('confidence', 0.0)
                
                # Check confidence for needs_review
                if drive.extraction_confidence < 0.85:
                    drive.extraction_status = ExtractionStatus.NEEDS_REVIEW
                else:
                    # In a real app, you might auto-confirm if confidence is very high, 
                    # but spec says College confirms it.
                    drive.extraction_status = ExtractionStatus.NEEDS_REVIEW 
                    
                await db.commit()
    except Exception as e:
        print(f"JD Extraction failed: {e}")


@router.post("/{drive_id}/jd-upload")
async def upload_jd_text(
    drive_id: str, 
    raw_text: str, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COMPANY_RECRUITER, UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(drive.company_id if current_user.role == UserRole.COMPANY_RECRUITER else drive.college_id, current_user)

    drive.raw_jd_text = raw_text
    drive.extraction_status = ExtractionStatus.PENDING
    await db.commit()
    
    background_tasks.add_task(run_jd_extraction_task, drive_id, raw_text)
    
    return {"message": "JD extraction started in background"}


@router.post("/{drive_id}/publish")
async def publish(
    drive_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(drive.college_id, current_user)
    
    drive = await publish_drive(drive, db)
    return {"message": "Drive published successfully", "status": drive.status}
