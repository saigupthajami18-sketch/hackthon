from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import UserRole
from app.schemas.auth import TokenData
from app.middleware.rbac import require_roles
from app.schemas.analytics_audit import PlacementFunnelResponse, ReadinessReportResponse
from app.services.analytics_service import get_placement_funnel, generate_readiness_score

router = APIRouter(tags=["Analytics & Dashboards"])

@router.get("/drives/{drive_id}/analytics/placement-funnel", response_model=PlacementFunnelResponse)
async def fetch_placement_funnel(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    try:
        funnel = await get_placement_funnel(db, drive_id)
        return funnel
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/students/{student_id}/analytics/readiness-report", response_model=ReadinessReportResponse)
async def fetch_readiness_report(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    try:
        report = await generate_readiness_score(db, student_id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
