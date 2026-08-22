"""
PlacementOps AI — Eligibility Engine (§7.2)
Deterministic business rules evaluation (NO LLM).
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.student import Student
from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models import EligibilityStatus, ApplicationStatus, DriveStatus


async def run_eligibility(drive_id: str, db: AsyncSession) -> int:
    """
    Evaluates eligibility for all students in the college against the drive's criteria.
    Creates or updates Application records. Returns count evaluated.
    """
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise ValueError("Drive not found")

    if not drive.eligibility_branches:
        raise ValueError("Drive has no eligibility criteria set — publish the drive first.")

    # Fetch all students in the college
    result = await db.execute(
        select(Student).where(Student.college_id == drive.college_id)
    )
    students = result.scalars().all()

    for student in students:
        elig_status = EligibilityStatus.ELIGIBLE
        reasons = []

        # Branch check
        if student.branch and drive.eligibility_branches:
            if student.branch.upper() not in [b.upper() for b in drive.eligibility_branches]:
                elig_status = EligibilityStatus.NOT_ELIGIBLE
                reasons.append(f"Branch '{student.branch}' not eligible (allowed: {', '.join(drive.eligibility_branches)})")

        # CGPA check
        if drive.eligibility_min_cgpa is not None:
            if student.cgpa is None:
                elig_status = EligibilityStatus.NEEDS_MANUAL_REVIEW
                reasons.append("CGPA missing — needs manual review")
            elif float(student.cgpa) < float(drive.eligibility_min_cgpa):
                elig_status = EligibilityStatus.NOT_ELIGIBLE
                reasons.append(f"CGPA {student.cgpa} below cutoff {drive.eligibility_min_cgpa}")

        # Backlog check
        if drive.eligibility_max_backlogs is not None:
            backlogs = student.active_backlogs or 0
            if backlogs > drive.eligibility_max_backlogs:
                elig_status = EligibilityStatus.NOT_ELIGIBLE
                reasons.append(f"Active backlogs {backlogs} exceeds limit {drive.eligibility_max_backlogs}")

        # Graduation year check
        if drive.eligibility_grad_years:
            allowed_years = [int(y) for y in drive.eligibility_grad_years]
            if student.graduation_year not in allowed_years:
                elig_status = EligibilityStatus.NOT_ELIGIBLE
                reasons.append(f"Grad year {student.graduation_year} not in {allowed_years}")

        reason_str = "; ".join(reasons) if reasons else "Meets all eligibility criteria."

        # Upsert Application
        existing = await db.execute(
            select(Application)
            .where(Application.student_id == student.student_id)
            .where(Application.drive_id == drive.drive_id)
        )
        application = existing.scalars().first()

        if application:
            application.eligibility_status = elig_status
            application.eligibility_reason = reason_str
        else:
            application = Application(
                student_id=student.student_id,
                drive_id=drive.drive_id,
                eligibility_status=elig_status,
                eligibility_reason=reason_str,
                application_status=ApplicationStatus.APPLIED,
            )
            db.add(application)

    drive.status = DriveStatus.ELIGIBILITY_COMPLETE
    await db.commit()
    return len(students)
