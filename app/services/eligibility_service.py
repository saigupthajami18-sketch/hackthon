"""
PlacementOps AI — Eligibility Engine (§7.2)
Deterministic business rules evaluation (NO LLM).
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.student import Student
from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models import EligibilityStatus
import json

async def run_eligibility(drive_id: str, db: AsyncSession):
    """
    Evaluates eligibility for all students in the college against the drive's criteria.
    Creates or updates Application records.
    """
    # 1. Fetch Drive
    drive = await db.get(JobDrive, drive_id)
    if not drive:
        raise ValueError("Drive not found")
        
    if not drive.eligibility_branches:
        raise ValueError("Drive has no eligibility criteria set")

    # 2. Fetch all students in the college
    result = await db.execute(
        select(Student).where(Student.college_id == drive.college_id)
    )
    students = result.scalars().all()

    # 3. Evaluate each student
    for student in students:
        status = EligibilityStatus.ELIGIBLE
        reasons = []

        # Check Branch
        if student.branch not in drive.eligibility_branches:
            status = EligibilityStatus.NOT_ELIGIBLE
            reasons.append(f"Branch '{student.branch}' not in eligible branches.")

        # Check CGPA
        if drive.eligibility_min_cgpa is not None:
            if student.cgpa is None:
                status = EligibilityStatus.NEEDS_MANUAL_REVIEW
                reasons.append("CGPA is missing.")
            elif student.cgpa < drive.eligibility_min_cgpa:
                status = EligibilityStatus.NOT_ELIGIBLE
                reasons.append(f"CGPA {student.cgpa} is below cutoff {drive.eligibility_min_cgpa}.")

        # Check Backlogs
        if drive.eligibility_max_backlogs is not None:
            if student.active_backlogs > drive.eligibility_max_backlogs:
                status = EligibilityStatus.NOT_ELIGIBLE
                reasons.append(f"Active backlogs {student.active_backlogs} exceeds max allowed {drive.eligibility_max_backlogs}.")

        # Check Graduation Year
        if drive.eligibility_grad_years:
            if student.graduation_year not in drive.eligibility_grad_years:
                status = EligibilityStatus.NOT_ELIGIBLE
                reasons.append(f"Graduation year {student.graduation_year} not in eligible years.")

        # Upsert Application
        existing_app_result = await db.execute(
            select(Application)
            .where(Application.student_id == student.student_id)
            .where(Application.drive_id == drive.drive_id)
        )
        application = existing_app_result.scalars().first()

        reason_str = "; ".join(reasons) if reasons else "Meets all criteria."

        if application:
            application.eligibility_status = status
            application.eligibility_reason = reason_str
        else:
            application = Application(
                student_id=student.student_id,
                drive_id=drive.drive_id,
                eligibility_status=status,
                eligibility_reason=reason_str
            )
            db.add(application)

    await db.commit()
    return len(students)
