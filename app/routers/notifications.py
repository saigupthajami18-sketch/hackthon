from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.database import get_db
from app.models import UserRole
from app.schemas.auth import TokenData
from app.services.auth_service import get_current_user
from app.middleware.rbac import require_roles
from app.schemas.notifications import NotificationSendRequest, NotificationResponse
from app.services.notification_service import send_notification, get_user_notifications, mark_as_read

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/send", response_model=NotificationResponse)
async def trigger_notification(
    request: NotificationSendRequest,
    db: AsyncSession = Depends(get_db),
    # System endpoint - typically protected by internal auth or service key, 
    # but restricting to COLLEGE_ADMIN/COMPANY_RECRUITER for manual trigger testing
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    try:
        notification = await send_notification(db, request)
        return notification
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[NotificationResponse])
async def fetch_my_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    notifications = await get_user_notifications(db, current_user.user_id)
    return notifications

@router.post("/{notification_id}/mark-read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    try:
        notification = await mark_as_read(db, notification_id, current_user.user_id)
        return notification
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
