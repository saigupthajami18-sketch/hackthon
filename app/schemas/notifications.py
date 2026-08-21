from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models import NotificationType, NotificationChannel, NotificationStatus

class NotificationSendRequest(BaseModel):
    user_id: UUID
    type: NotificationType
    channel: NotificationChannel
    message: str

class NotificationResponse(BaseModel):
    notification_id: UUID
    user_id: UUID
    type: NotificationType
    channel: NotificationChannel
    message: str
    status: NotificationStatus
    sent_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
