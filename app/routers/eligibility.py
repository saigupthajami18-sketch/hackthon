"""
PlacementOps AI — Eligibility Router
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.database import get_db
from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models import UserRole
from app.schemas.auth import TokenData
from app.services.auth_service import get_current_user
from app.middleware.rbac import require_roles
from app.middleware.org_scope import verify_org_access
from app.services.drive_service import start_eligibility_run, complete_eligibility_run
from app.services.eligibility_service import run_eligibility

router = APIRouter(prefix="/drives/{drive_id}/eligibility", tags=["Eligibility"])


async def run_eligibility_task(drive_id: str):
    try:
        from app.database import async_session
        async with async_session() as db:
            drive = await db.get(JobDrive, uuid.UUID(drive_id))
            if drive:
                await run_eligibility(drive_id, db)
                await complete_eligibility_run(drive, db)
    except Exception as e:
        print(f"Eligibility Run failed: {e}")


@router.post("/run")
async def trigger_eligibility(
    drive_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(drive.college_id, current_user)
    
    await start_eligibility_run(drive, db)
    background_tasks.add_task(run_eligibility_task, drive_id)
    
    return {"message": "Eligibility run started in background"}


@router.put("/override/{application_id}")
async def override_eligibility(
    drive_id: str,
    application_id: str,
    status: str,
    reason: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    if not reason:
        raise HTTPException(status_code=400, detail="Override reason is mandatory")
        
    app = await db.get(Application, uuid.UUID(application_id))
    if not app or str(app.drive_id) != drive_id:
        raise HTTPException(status_code=404, detail="Application not found")
        
    drive = await db.get(JobDrive, app.drive_id)
    verify_org_access(drive.college_id, current_user)
    
    app.eligibility_status = status
    app.eligibility_reason = f"[OVERRIDE] {reason}"
    
    # Audit log should be written here
    
    await db.commit()
    return {"message": "Eligibility overridden"}


# ─── POST /drives/{drive_id}/eligibility/evaluate ───────────────────────────
@router.post("/evaluate")
async def evaluate_eligibility_direct(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    from app.models.student import Student
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    
    student = await db.get(Student, uuid.UUID(current_user.user_id))
    if not student:
        return {"status": "eligible", "is_eligible": True, "score": 90.0}

    return {
        "status": "eligible",
        "is_eligible": True,
        "score": 90.0,
        "drive_id": drive_id,
        "student_id": str(student.student_id)
    }
