from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.models import UserRole
from app.schemas.auth import TokenData
from app.middleware.rbac import require_roles
from app.schemas.analytics_audit import AuditLogResponse
from app.services.audit_service import get_audit_logs

router = APIRouter(tags=["Audit Logs"])

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def fetch_audit_logs(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    actor_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    try:
        logs = await get_audit_logs(db, entity_type, entity_id, actor_id)
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
