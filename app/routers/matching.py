"""
PlacementOps AI — Matching Router
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.database import get_db
from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models.student import Student
from app.models.user import User
from app.models import UserRole, ShortlistStatus, ApplicationStatus, DriveStatus
from app.schemas.auth import TokenData
from app.middleware.rbac import require_roles
from app.middleware.org_scope import verify_org_access
from app.services.matching_service import run_matching

router = APIRouter(tags=["Matching & Shortlisting"])


async def _run_matching_task(drive_id: str):
    try:
        from app.database import async_session
        async with async_session() as db:
            await run_matching(drive_id, db)
    except Exception as e:
        print(f"Matching run failed: {e}")


# ─── POST /drives/{id}/matching/run ──────────────────────────────────────────
@router.post("/drives/{drive_id}/matching/run")
async def trigger_matching(
    drive_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    verify_org_access(drive.college_id, current_user)

    drive.status = DriveStatus.MATCHING_RUNNING
    await db.commit()
    background_tasks.add_task(_run_matching_task, drive_id)
    return {"message": "Matching started in background"}


# ─── GET /drives/{id}/matching/results ───────────────────────────────────────
@router.get("/drives/{drive_id}/matching/results")
async def get_matching_results(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    result = await db.execute(
        select(Application, Student, User)
        .join(Student, Application.student_id == Student.student_id)
        .join(User, Student.student_id == User.user_id)
        .where(Application.drive_id == uuid.UUID(drive_id))
        .where(Application.match_score.isnot(None))
        .order_by(Application.match_score.desc())
    )
    rows = result.all()

    return [
        {
            "application_id": str(app.application_id),
            "student_id": str(student.student_id),
            "student_name": user.name,
            "student_branch": student.branch,
            "student_cgpa": float(student.cgpa) if student.cgpa else None,
            "match_score": float(app.match_score),
            "match_explanation": app.match_explanation,
            "skill_gap": app.skill_gap or [],
            "shortlist_status": app.shortlist_status.value if app.shortlist_status else None,
            "application_status": app.application_status.value if app.application_status else None,
        }
        for app, student, user in rows
    ]


# ─── POST /applications/{id}/shortlist ───────────────────────────────────────
@router.post("/applications/{application_id}/shortlist")
async def shortlist_candidate(
    application_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    """
    payload: {"action": "approve" | "reject"}
    """
    app = await db.get(Application, uuid.UUID(application_id))
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    action = payload.get("action", "approve")
    if action == "approve":
        app.shortlist_status = ShortlistStatus.APPROVED
        app.application_status = ApplicationStatus.SHORTLISTED
    elif action == "reject":
        app.shortlist_status = ShortlistStatus.REJECTED
        app.application_status = ApplicationStatus.REJECTED
    else:
        raise HTTPException(status_code=400, detail="action must be 'approve' or 'reject'")

    await db.commit()
    return {"message": f"Candidate {action}d", "shortlist_status": app.shortlist_status.value}


# ─── GET /drives/{id}/shortlist ──────────────────────────────────────────────
@router.get("/drives/{drive_id}/shortlist")
async def get_shortlist(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    result = await db.execute(
        select(Application, Student, User)
        .join(Student, Application.student_id == Student.student_id)
        .join(User, Student.student_id == User.user_id)
        .where(Application.drive_id == uuid.UUID(drive_id))
        .where(Application.shortlist_status == ShortlistStatus.APPROVED)
        .order_by(Application.match_score.desc())
    )
    rows = result.all()
    return [
        {
            "application_id": str(app.application_id),
            "student_name": user.name,
            "student_cgpa": float(student.cgpa) if student.cgpa else None,
            "match_score": float(app.match_score) if app.match_score else None,
            "application_status": app.application_status.value if app.application_status else None,
        }
        for app, student, user in rows
    ]
