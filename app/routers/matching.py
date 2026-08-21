"""
PlacementOps AI — Matching Router
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.models.job_drive import JobDrive
from app.models import UserRole
from app.schemas.auth import TokenData
from app.middleware.rbac import require_roles
from app.middleware.org_scope import verify_org_access
from app.services.matching_service import run_matching

router = APIRouter(prefix="/drives/{drive_id}/matching", tags=["Matching"])


async def run_matching_task(drive_id: str):
    try:
        from app.database import async_session
        async with async_session() as db:
            await run_matching(drive_id, db)
    except Exception as e:
        print(f"Matching Run failed: {e}")


@router.post("/run")
async def trigger_matching(
    drive_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(drive.college_id if current_user.role == UserRole.COLLEGE_ADMIN else drive.company_id, current_user)
    
    background_tasks.add_task(run_matching_task, drive_id)
    
    return {"message": "AI matching run started in background"}
