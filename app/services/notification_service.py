import uuid
from datetime import datetime
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.notification import Notification
from app.models import NotificationStatus
from app.schemas.notifications import NotificationSendRequest

async def send_notification(db: AsyncSession, request: NotificationSendRequest) -> Notification:
    # 1. Create DB record
    notification = Notification(
        user_id=request.user_id,
        type=request.type,
        channel=request.channel,
        message=request.message,
        status=NotificationStatus.QUEUED
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    
    # 2. Mock sending via n8n webhook
    print(f"[n8n webhook mocked] Sending {request.channel.name} to User {request.user_id}: {request.message}")
    
    # 3. Update status to SENT
    notification.status = NotificationStatus.SENT
    notification.sent_at = datetime.utcnow()
    await db.commit()
    await db.refresh(notification)
    
    return notification

async def get_user_notifications(db: AsyncSession, user_id: str) -> List[Notification]:
    stmt = select(Notification).where(
        Notification.user_id == uuid.UUID(user_id)
    ).order_by(Notification.created_at.desc())
    
    result = await db.execute(stmt)
    return result.scalars().all()

async def mark_as_read(db: AsyncSession, notification_id: str, user_id: str) -> Notification:
    notification = await db.get(Notification, uuid.UUID(notification_id))
    if not notification:
        raise ValueError("Notification not found")
        
    if str(notification.user_id) != user_id:
        raise ValueError("Not authorized to read this notification")
        
    # Technically there is no 'READ' status in the spec for NotificationStatus (only QUEUED, SENT, FAILED),
    # but we can simulate marking read or extend it later.
    # For now, just return it.
    return notification
