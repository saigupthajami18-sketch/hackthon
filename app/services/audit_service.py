import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.audit_log import AuditLog
from app.models import ActorType
from app.schemas.analytics_audit import AuditLogCreate

async def log_action(db: AsyncSession, log_in: AuditLogCreate) -> AuditLog:
    log_entry = AuditLog(
        actor_id=log_in.actor_id,
        actor_type=ActorType(log_in.actor_type),
        action_type=log_in.action_type,
        entity_type=log_in.entity_type,
        entity_id=uuid.UUID(log_in.entity_id),
        before_state=log_in.before_state,
        after_state=log_in.after_state,
        reason=log_in.reason
    )
    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    return log_entry

async def get_audit_logs(db: AsyncSession, entity_type: str = None, entity_id: str = None, actor_id: str = None) -> List[AuditLog]:
    stmt = select(AuditLog)
    
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)
    if entity_id:
        stmt = stmt.where(AuditLog.entity_id == uuid.UUID(entity_id))
    if actor_id:
        stmt = stmt.where(AuditLog.actor_id == uuid.UUID(actor_id))
        
    stmt = stmt.order_by(AuditLog.timestamp.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
