"""
PlacementOps AI — Notifications Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.database import get_db
from app.models.notification import Notification
from app.models import UserRole, NotificationStatus
from app.schemas.auth import TokenData
from app.middleware.rbac import require_roles

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    """Get notifications for the currently authenticated user."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == uuid.UUID(current_user.user_id))
        .order_by(Notification.sent_at.desc())
        .limit(50)
    )
    notifications = result.scalars().all()
    return [
        {
            "notification_id": str(n.notification_id),
            "type": n.type.value if n.type else None,
            "channel": n.channel.value if n.channel else None,
            "message": n.message,
            "status": n.status.value if n.status else None,
            "created_at": n.sent_at.isoformat() if n.sent_at else None,
        }
        for n in notifications
    ]


@router.post("/send")
async def send_notification(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    from app.models import NotificationType, NotificationChannel
    notif = Notification(
        user_id=uuid.UUID(payload["user_id"]),
        type=NotificationType(payload.get("type", "generic")),
        channel=NotificationChannel.IN_APP,
        message=payload["message"],
        status=NotificationStatus.SENT,
    )
    db.add(notif)
    await db.commit()
    return {"message": "Notification sent"}


@router.post("/{notification_id}/mark-read")
async def mark_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    notif = await db.get(Notification, uuid.UUID(notification_id))
    if not notif or str(notif.user_id) != current_user.user_id:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.status = NotificationStatus.SENT
    await db.commit()
    return {"message": "Marked as read"}
