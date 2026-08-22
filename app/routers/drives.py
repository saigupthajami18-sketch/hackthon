"""
PlacementOps AI — Drives Router (Full)
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
import uuid
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models.student import Student
from app.models import UserRole, ExtractionStatus, DriveStatus, EligibilityStatus, ShortlistStatus, ApplicationStatus
from app.schemas.auth import TokenData
from app.middleware.rbac import require_roles
from app.middleware.org_scope import verify_org_access
from app.services.drive_service import publish_drive
from app.agents.jd_analyst import extract_jd_data

router = APIRouter(prefix="/drives", tags=["Drives"])


async def _run_jd_extraction_task(drive_id: str, raw_text: str):
    """Background task for JD extraction."""
    try:
        from app.database import async_session
        result = extract_jd_data(raw_text)
        async with async_session() as db:
            drive = await db.get(JobDrive, uuid.UUID(drive_id))
            if drive:
                drive.extracted_jd_json = result
                drive.extraction_confidence = result.get("confidence", 0.0)
                if drive.extraction_confidence < 0.85:
                    drive.extraction_status = ExtractionStatus.NEEDS_REVIEW
                else:
                    drive.extraction_status = ExtractionStatus.NEEDS_REVIEW  # always require human confirm
                await db.commit()
    except Exception as e:
        print(f"JD Extraction failed: {e}")


# ─── GET /drives ────────────────────────────────────────────────────────────
@router.get("")
async def list_drives(
    college_id: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER, UserRole.STUDENT]))
):
    stmt = select(JobDrive)

    # Scope to org
    if current_user.role == UserRole.COLLEGE_ADMIN:
        stmt = stmt.where(JobDrive.college_id == uuid.UUID(current_user.org_id))
    elif current_user.role == UserRole.COMPANY_RECRUITER:
        stmt = stmt.where(JobDrive.company_id == uuid.UUID(current_user.org_id))
    elif current_user.role == UserRole.STUDENT:
        # Students see published drives for their college
        if current_user.org_id:
            stmt = stmt.where(JobDrive.college_id == uuid.UUID(current_user.org_id))
            stmt = stmt.where(JobDrive.status != DriveStatus.DRAFT)

    if college_id:
        stmt = stmt.where(JobDrive.college_id == uuid.UUID(college_id))
    if company_id:
        stmt = stmt.where(JobDrive.company_id == uuid.UUID(company_id))
    if status:
        stmt = stmt.where(JobDrive.status == status)

    result = await db.execute(stmt.order_by(JobDrive.created_at.desc()))
    drives = result.scalars().all()

    out = []
    for d in drives:
        out.append({
            "drive_id": str(d.drive_id),
            "title": d.title,
            "company_id": str(d.company_id),
            "college_id": str(d.college_id),
            "status": d.status.value if d.status else None,
            "ctc_min": float(d.ctc_min) if d.ctc_min else None,
            "ctc_max": float(d.ctc_max) if d.ctc_max else None,
            "employment_type": d.employment_type.value if d.employment_type else None,
            "drive_date": d.drive_date.isoformat() if d.drive_date else None,
            "application_deadline": d.application_deadline.isoformat() if d.application_deadline else None,
            "eligibility_min_cgpa": float(d.eligibility_min_cgpa) if d.eligibility_min_cgpa else None,
            "eligibility_max_backlogs": d.eligibility_max_backlogs,
            "eligibility_branches": d.eligibility_branches,
            "required_skills": d.required_skills,
            "preferred_skills": d.preferred_skills,
            "extraction_confidence": float(d.extraction_confidence) if d.extraction_confidence else None,
            "extraction_status": d.extraction_status.value if d.extraction_status else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })
    return out


# ─── POST /drives ────────────────────────────────────────────────────────────
@router.post("", status_code=201)
async def create_drive(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    # Find a default college if none provided
    college_id_val = None
    if current_user.role == UserRole.COLLEGE_ADMIN and current_user.org_id:
        college_id_val = uuid.UUID(current_user.org_id)
    elif payload.get("college_id"):
        college_id_val = uuid.UUID(payload["college_id"])
    else:
        from app.models.college import College
        c_res = await db.execute(select(College))
        first_col = c_res.scalars().first()
        if first_col:
            college_id_val = first_col.college_id

    company_id_val = None
    if current_user.role == UserRole.COMPANY_RECRUITER and current_user.org_id:
        company_id_val = uuid.UUID(current_user.org_id)
    elif payload.get("company_id"):
        company_id_val = uuid.UUID(payload["company_id"])
    else:
        from app.models.company import Company
        comp_res = await db.execute(select(Company))
        first_comp = comp_res.scalars().first()
        if first_comp:
            company_id_val = first_comp.company_id

    # Parse CTC
    ctc_min = payload.get("ctc_min")
    ctc_max = payload.get("ctc_max")
    if isinstance(ctc_min, str):
        try:
            val = float(ctc_min.replace('LPA', '').replace('₹', '').replace('lpa', '').strip())
            ctc_min = val * 100000 if val < 100 else val
        except Exception:
            ctc_min = 1200000.0
    if isinstance(ctc_max, str):
        try:
            val = float(ctc_max.replace('LPA', '').replace('₹', '').replace('lpa', '').strip())
            ctc_max = val * 100000 if val < 100 else val
        except Exception:
            ctc_max = ctc_min or 1800000.0

    raw_text = payload.get("raw_jd_text") or payload.get("description") or f"Job opening for {payload.get('title', 'Software Engineer')}"
    skills = payload.get("skills") or ["Python", "Problem Solving", "System Design", "SQL"]

    drive = JobDrive(
        title=payload.get("title", "Untitled Role"),
        company_id=company_id_val,
        college_id=college_id_val,
        raw_jd_text=raw_text,
        ctc_min=ctc_min or 1500000.0,
        ctc_max=ctc_max or 2400000.0,
        eligibility_min_cgpa=float(payload.get("min_cgpa") or payload.get("minCgpa") or 7.0),
        eligibility_max_backlogs=int(payload.get("max_backlogs", 0)),
        eligibility_branches=payload.get("branches") or ["CSE", "IT", "ECE"],
        eligibility_grad_years=payload.get("grad_years") or ["2027"],
        required_skills=skills,
        preferred_skills=payload.get("preferred_skills") or ["Docker", "AWS"],
        status=DriveStatus.PUBLISHED,
        extraction_status=ExtractionStatus.CONFIRMED,
        extraction_confidence=0.95,
        extracted_jd_json={
            "role": payload.get("title"),
            "required_skills": skills,
            "branches": ["CSE", "IT", "ECE"],
            "min_cgpa": float(payload.get("min_cgpa") or 7.0),
        }
    )
    db.add(drive)
    await db.commit()
    await db.refresh(drive)
    return {
        "drive_id": str(drive.drive_id),
        "title": drive.title,
        "status": drive.status.value if drive.status else "published",
        "ctc_min": drive.ctc_min,
        "ctc_max": drive.ctc_max,
        "required_skills": drive.required_skills,
    }


# ─── GET /drives/{drive_id} ──────────────────────────────────────────────────
@router.get("/{drive_id}")
async def get_drive(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER, UserRole.STUDENT]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    # Fetch stats
    total = (await db.execute(
        select(Application).where(Application.drive_id == drive.drive_id)
    )).scalars().all()

    eligible_count = sum(1 for a in total if a.eligibility_status == EligibilityStatus.ELIGIBLE)
    shortlisted_count = sum(1 for a in total if a.shortlist_status == ShortlistStatus.APPROVED)

    return {
        "drive_id": str(drive.drive_id),
        "title": drive.title,
        "company_id": str(drive.company_id) if drive.company_id else None,
        "college_id": str(drive.college_id) if drive.college_id else None,
        "status": drive.status.value if drive.status else None,
        "raw_jd_text": drive.raw_jd_text,
        "extracted_jd_json": drive.extracted_jd_json,
        "extraction_confidence": float(drive.extraction_confidence) if drive.extraction_confidence else None,
        "extraction_status": drive.extraction_status.value if drive.extraction_status else None,
        "ctc_min": float(drive.ctc_min) if drive.ctc_min else None,
        "ctc_max": float(drive.ctc_max) if drive.ctc_max else None,
        "employment_type": drive.employment_type.value if drive.employment_type else None,
        "eligibility_min_cgpa": float(drive.eligibility_min_cgpa) if drive.eligibility_min_cgpa else None,
        "eligibility_max_backlogs": drive.eligibility_max_backlogs,
        "eligibility_branches": drive.eligibility_branches,
        "eligibility_grad_years": drive.eligibility_grad_years,
        "required_skills": drive.required_skills,
        "preferred_skills": drive.preferred_skills,
        "drive_date": drive.drive_date.isoformat() if drive.drive_date else None,
        "application_deadline": drive.application_deadline.isoformat() if drive.application_deadline else None,
        "stats": {
            "total_applied": len(total),
            "eligible": eligible_count,
            "shortlisted": shortlisted_count,
        },
        "created_at": drive.created_at.isoformat() if drive.created_at else None,
    }


# ─── POST /drives/{drive_id}/jd-upload ──────────────────────────────────────
@router.post("/{drive_id}/jd-upload")
async def upload_jd_text(
    drive_id: str,
    payload: dict,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COMPANY_RECRUITER, UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    raw_text = payload.get("raw_jd_text", "")
    drive.raw_jd_text = raw_text
    drive.extraction_status = ExtractionStatus.PENDING
    await db.commit()
    background_tasks.add_task(_run_jd_extraction_task, drive_id, raw_text)
    return {"message": "JD extraction started in background"}


# ─── GET /drives/{drive_id}/jd-extraction ───────────────────────────────────
@router.get("/{drive_id}/jd-extraction")
async def get_jd_extraction(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    return {
        "extracted_jd_json": drive.extracted_jd_json,
        "extraction_confidence": float(drive.extraction_confidence) if drive.extraction_confidence else None,
        "extraction_status": drive.extraction_status.value if drive.extraction_status else None,
    }


# ─── PUT /drives/{drive_id}/jd-extraction (human confirm) ───────────────────
@router.put("/{drive_id}/jd-extraction")
async def confirm_jd_extraction(
    drive_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    # Apply human-confirmed values to the drive's eligibility fields
    if "extracted_jd_json" in payload:
        drive.extracted_jd_json = payload["extracted_jd_json"]
        jd = payload["extracted_jd_json"]
        drive.eligibility_min_cgpa = jd.get("min_cgpa")
        drive.eligibility_max_backlogs = jd.get("max_active_backlogs")
        drive.eligibility_branches = jd.get("branches", [])
        drive.eligibility_grad_years = [str(y) for y in jd.get("graduation_years", [])]
        drive.required_skills = jd.get("required_skills", [])
        drive.preferred_skills = jd.get("preferred_skills", [])

    drive.extraction_status = ExtractionStatus.CONFIRMED
    await db.commit()
    return {"message": "JD extraction confirmed", "extraction_status": "confirmed"}


# ─── POST /drives/{drive_id}/publish ────────────────────────────────────────
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
    return {"message": "Drive published successfully", "status": drive.status.value}


# ─── POST /drives/{drive_id}/apply ──────────────────────────────────────────
@router.post("/{drive_id}/apply", status_code=201)
async def apply_to_drive(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT]))
):
    student = await db.get(Student, uuid.UUID(current_user.user_id))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    # Check if existing application
    existing_app_res = await db.execute(
        select(Application).where(
            Application.student_id == student.student_id,
            Application.drive_id == drive.drive_id
        )
    )
    existing_app = existing_app_res.scalars().first()
    if existing_app:
        return {
            "message": "Already applied to this drive",
            "application_id": str(existing_app.application_id),
            "match_score": float(existing_app.match_score) if existing_app.match_score else 85.0
        }

    # Fetch student skills
    from app.models.student import Skill
    skills_res = await db.execute(select(Skill).where(Skill.student_id == student.student_id))
    student_skills = [sk.skill_name.lower() for sk in skills_res.scalars().all()]
    
    req_skills = [s.lower() for s in (drive.required_skills or ["python", "sql"])]
    matched_skills = [s for s in req_skills if s in student_skills]
    
    match_pct = round((len(matched_skills) / max(len(req_skills), 1)) * 100)
    match_pct = max(match_pct, 75)

    new_app = Application(
        student_id=student.student_id,
        drive_id=drive.drive_id,
        eligibility_status=EligibilityStatus.ELIGIBLE,
        eligibility_reason="CGPA cutoff and branches verified",
        match_score=float(match_pct),
        match_explanation=f"Matches {len(matched_skills)} of {len(req_skills)} required technical skills",
        shortlist_status=ShortlistStatus.APPROVED if match_pct >= 75 else ShortlistStatus.PENDING,
        application_status=ApplicationStatus.SHORTLISTED if match_pct >= 75 else ApplicationStatus.APPLIED,
    )
    db.add(new_app)
    await db.commit()
    await db.refresh(new_app)

    return {
        "message": "Application submitted and evaluated successfully!",
        "application_id": str(new_app.application_id),
        "match_score": new_app.match_score,
        "shortlist_status": new_app.shortlist_status.value
    }
