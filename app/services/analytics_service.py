import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.application import Application
from app.models import ApplicationStatus, EligibilityStatus, ShortlistStatus
from app.schemas.analytics_audit import PlacementFunnelResponse, ReadinessReportResponse
from app.models.student import Student

async def get_placement_funnel(db: AsyncSession, drive_id: str) -> PlacementFunnelResponse:
    # 1. Total applied
    stmt_total = select(func.count()).select_from(Application).where(Application.drive_id == uuid.UUID(drive_id))
    total_applied = (await db.execute(stmt_total)).scalar()
    
    # 2. Eligible
    stmt_eligible = select(func.count()).select_from(Application).where(
        Application.drive_id == uuid.UUID(drive_id),
        Application.eligibility_status == EligibilityStatus.ELIGIBLE
    )
    eligible = (await db.execute(stmt_eligible)).scalar()
    
    # 3. Matched
    # We define matched as those with a match_score
    stmt_matched = select(func.count()).select_from(Application).where(
        Application.drive_id == uuid.UUID(drive_id),
        Application.match_score.isnot(None)
    )
    matched = (await db.execute(stmt_matched)).scalar()
    
    # 4. Shortlisted
    stmt_shortlisted = select(func.count()).select_from(Application).where(
        Application.drive_id == uuid.UUID(drive_id),
        Application.shortlist_status == ShortlistStatus.APPROVED
    )
    shortlisted = (await db.execute(stmt_shortlisted)).scalar()
    
    # 5. Interview Scheduled
    stmt_interview = select(func.count()).select_from(Application).where(
        Application.drive_id == uuid.UUID(drive_id),
        Application.application_status.in_([
            ApplicationStatus.INTERVIEW_SCHEDULED,
            ApplicationStatus.INTERVIEW_COMPLETED,
            ApplicationStatus.RESULT_PENDING,
            ApplicationStatus.SELECTED,
            ApplicationStatus.WAITLISTED,
            ApplicationStatus.OFFER_ISSUED,
            ApplicationStatus.OFFER_ACCEPTED
        ])
    )
    interview_scheduled = (await db.execute(stmt_interview)).scalar()
    
    # 6. Selected
    stmt_selected = select(func.count()).select_from(Application).where(
        Application.drive_id == uuid.UUID(drive_id),
        Application.application_status.in_([
            ApplicationStatus.SELECTED,
            ApplicationStatus.OFFER_ISSUED,
            ApplicationStatus.OFFER_ACCEPTED
        ])
    )
    selected = (await db.execute(stmt_selected)).scalar()
    
    # 7. Offer Accepted
    stmt_offer = select(func.count()).select_from(Application).where(
        Application.drive_id == uuid.UUID(drive_id),
        Application.application_status == ApplicationStatus.OFFER_ACCEPTED
    )
    offer_accepted = (await db.execute(stmt_offer)).scalar()
    
    return PlacementFunnelResponse(
        total_applied=total_applied,
        eligible=eligible,
        matched=matched,
        shortlisted=shortlisted,
        interview_scheduled=interview_scheduled,
        selected=selected,
        offer_accepted=offer_accepted
    )

async def generate_readiness_score(db: AsyncSession, student_id: str) -> ReadinessReportResponse:
    # A mocked algorithm for the demo
    # In reality, this would trigger an Analytics Agent or a complex SQL aggregation
    
    student = await db.get(Student, uuid.UUID(student_id))
    if not student:
        raise ValueError("Student not found")
        
    base_score = float(student.cgpa) * 10 if student.cgpa else 0
    # penalty for backlogs
    penalty = (student.active_backlogs * 5) if student.active_backlogs else 0
    
    final_score = max(0, min(100, base_score - penalty))
    
    return ReadinessReportResponse(
        student_id=student.student_id,
        readiness_score=final_score,
        strengths=["Good CGPA"] if final_score > 75 else [],
        improvement_areas=["Clear backlogs"] if student.active_backlogs else ["Gain more practical skills"]
    )
