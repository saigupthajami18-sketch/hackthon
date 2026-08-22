"""
PlacementOps AI — College Router (Dashboard, Students, Analytics)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import uuid
from typing import Optional

from app.database import get_db
from app.models.college import College
from app.models.student import Student, Skill
from app.models.user import User
from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models.audit_log import AuditLog
from app.models import UserRole, DriveStatus, EligibilityStatus, ShortlistStatus, ApplicationStatus
from app.schemas.auth import TokenData
from app.middleware.rbac import require_roles

router = APIRouter(tags=["College"])


# ─── GET /college/{id}/dashboard/pending-actions ─────────────────────────────
@router.get("/college/{college_id}/dashboard/pending-actions")
async def dashboard_pending_actions(
    college_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    # Active drives count
    drives_result = await db.execute(
        select(func.count()).select_from(JobDrive)
        .where(JobDrive.college_id == uuid.UUID(college_id))
        .where(JobDrive.status.notin_([DriveStatus.DRAFT, DriveStatus.CLOSED]))
    )
    active_drives = drives_result.scalar() or 0

    # Pending approval drives (shortlist waiting)
    pending_shortlist = (await db.execute(
        select(func.count()).select_from(JobDrive)
        .where(JobDrive.college_id == uuid.UUID(college_id))
        .where(JobDrive.status == DriveStatus.SHORTLIST_PENDING_APPROVAL)
    )).scalar() or 0

    pending_schedule = (await db.execute(
        select(func.count()).select_from(JobDrive)
        .where(JobDrive.college_id == uuid.UUID(college_id))
        .where(JobDrive.status == DriveStatus.SCHEDULE_PENDING_APPROVAL)
    )).scalar() or 0

    total_students = (await db.execute(
        select(func.count()).select_from(Student)
        .where(Student.college_id == uuid.UUID(college_id))
    )).scalar() or 0

    return {
        "active_drives": active_drives,
        "pending_approvals": pending_shortlist + pending_schedule,
        "pending_shortlist": pending_shortlist,
        "pending_schedule": pending_schedule,
        "total_students": total_students,
        "conflicts": 0,  # TODO: implement conflict detection count
    }


# ─── GET /college/{id}/students ──────────────────────────────────────────────
@router.get("/college/{college_id}/students")
async def list_students(
    college_id: str,
    branch: Optional[str] = Query(None),
    min_cgpa: Optional[float] = Query(None),
    max_backlogs: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    stmt = (
        select(Student, User)
        .join(User, Student.student_id == User.user_id)
        .where(Student.college_id == uuid.UUID(college_id))
    )

    if branch:
        stmt = stmt.where(Student.branch.ilike(f"%{branch}%"))
    if min_cgpa is not None:
        stmt = stmt.where(Student.cgpa >= min_cgpa)
    if max_backlogs is not None:
        stmt = stmt.where(Student.active_backlogs <= max_backlogs)
    if search:
        stmt = stmt.where(User.name.ilike(f"%{search}%"))

    stmt = stmt.offset(offset).limit(limit).order_by(Student.cgpa.desc())
    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "student_id": str(s.student_id),
            "name": u.name,
            "email": u.email,
            "roll_no": s.roll_no,
            "branch": s.branch,
            "graduation_year": s.graduation_year,
            "cgpa": float(s.cgpa) if s.cgpa else None,
            "active_backlogs": s.active_backlogs,
            "attendance_pct": float(s.attendance_pct) if s.attendance_pct else None,
            "readiness_score": float(s.readiness_score) if s.readiness_score else None,
        }
        for s, u in rows
    ]


# ─── GET /college/{id}/analytics/skill-gap ───────────────────────────────────
@router.get("/college/{college_id}/analytics/skill-gap")
async def skill_gap_analytics(
    college_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    """
    Returns: for each skill required by active drives, how many students have it vs total eligible.
    """
    # Get all active drives for this college
    drives_result = await db.execute(
        select(JobDrive)
        .where(JobDrive.college_id == uuid.UUID(college_id))
        .where(JobDrive.status.notin_([DriveStatus.DRAFT, DriveStatus.CLOSED]))
    )
    drives = drives_result.scalars().all()

    # Collect all required skills from drives
    from collections import Counter, defaultdict
    skill_demand = Counter()  # skill_name -> count of drives requiring it
    for drive in drives:
        for skill in (drive.required_skills or []):
            skill_demand[skill] += 1

    if not skill_demand:
        return {"skill_gaps": [], "total_students": 0}

    # Get all student skills in this college
    skills_result = await db.execute(
        select(Skill)
        .join(Student, Skill.student_id == Student.student_id)
        .where(Student.college_id == uuid.UUID(college_id))
    )
    all_skills = skills_result.scalars().all()

    student_skills = defaultdict(set)
    for sk in all_skills:
        student_skills[str(sk.student_id)].add(sk.skill_name.lower())

    total_students = len(student_skills)

    gap_data = []
    for skill, demand in sorted(skill_demand.items(), key=lambda x: -x[1]):
        have_skill = sum(1 for skills in student_skills.values() if skill.lower() in skills)
        gap_data.append({
            "skill": skill,
            "demand_score": demand,
            "students_with_skill": have_skill,
            "students_without": total_students - have_skill,
            "coverage_pct": round(have_skill / total_students * 100, 1) if total_students else 0,
        })

    return {
        "skill_gaps": gap_data,
        "total_students": total_students,
        "active_drives": len(drives),
    }


# ─── GET /college/{id}/analytics/placement-funnel ────────────────────────────
@router.get("/college/{college_id}/analytics/placement-funnel")
async def placement_funnel(
    college_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    total_students = (await db.execute(
        select(func.count()).select_from(Student).where(Student.college_id == uuid.UUID(college_id))
    )).scalar() or 0

    applied = (await db.execute(
        select(func.count()).select_from(Application)
        .join(Student, Application.student_id == Student.student_id)
        .where(Student.college_id == uuid.UUID(college_id))
    )).scalar() or 0

    eligible = (await db.execute(
        select(func.count()).select_from(Application)
        .join(Student, Application.student_id == Student.student_id)
        .where(Student.college_id == uuid.UUID(college_id))
        .where(Application.eligibility_status == EligibilityStatus.ELIGIBLE)
    )).scalar() or 0

    shortlisted = (await db.execute(
        select(func.count()).select_from(Application)
        .join(Student, Application.student_id == Student.student_id)
        .where(Student.college_id == uuid.UUID(college_id))
        .where(Application.shortlist_status == ShortlistStatus.APPROVED)
    )).scalar() or 0

    interviewed = (await db.execute(
        select(func.count()).select_from(Application)
        .join(Student, Application.student_id == Student.student_id)
        .where(Student.college_id == uuid.UUID(college_id))
        .where(Application.application_status.in_([
            ApplicationStatus.INTERVIEW_SCHEDULED,
            ApplicationStatus.INTERVIEW_COMPLETED,
            ApplicationStatus.SELECTED,
            ApplicationStatus.OFFER_ISSUED,
            ApplicationStatus.OFFER_ACCEPTED,
        ]))
    )).scalar() or 0

    selected = (await db.execute(
        select(func.count()).select_from(Application)
        .join(Student, Application.student_id == Student.student_id)
        .where(Student.college_id == uuid.UUID(college_id))
        .where(Application.application_status.in_([
            ApplicationStatus.SELECTED,
            ApplicationStatus.OFFER_ISSUED,
            ApplicationStatus.OFFER_ACCEPTED,
        ]))
    )).scalar() or 0

    return {
        "total_students": total_students,
        "applied": applied,
        "eligible": eligible,
        "shortlisted": shortlisted,
        "interviewed": interviewed,
        "selected": selected,
    }
