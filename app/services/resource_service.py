import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.panel import Panel
from app.models.room import Room
from app.schemas.panels_rooms import PanelCreate, PanelUpdate, RoomCreate, RoomUpdate

async def create_panel(db: AsyncSession, drive_id: str, panel_in: PanelCreate) -> Panel:
    members_data = [m.model_dump() for m in panel_in.members]
    slots_data = [s.model_dump() for s in panel_in.availability_slots] if panel_in.availability_slots else []
    # format datetime to string for jsonb if needed, but pydantic dict might keep them as datetime. 
    # SQLAlchemy JSONB usually requires primitive types. Let's make sure they are strings.
    for s in slots_data:
        s["start"] = s["start"].isoformat()
        s["end"] = s["end"].isoformat()
    for m in members_data:
        m["user_id"] = str(m["user_id"])

    panel = Panel(
        drive_id=uuid.UUID(drive_id),
        name=panel_in.name,
        member_type=panel_in.member_type,
        members=members_data,
        availability_slots=slots_data
    )
    db.add(panel)
    await db.commit()
    await db.refresh(panel)
    return panel

async def get_panels_by_drive(db: AsyncSession, drive_id: str) -> List[Panel]:
    stmt = select(Panel).where(Panel.drive_id == uuid.UUID(drive_id))
    result = await db.execute(stmt)
    return result.scalars().all()

async def create_room(db: AsyncSession, college_id: str, room_in: RoomCreate) -> Room:
    slots_data = [s.model_dump() for s in room_in.availability_slots] if room_in.availability_slots else []
    for s in slots_data:
        s["start"] = s["start"].isoformat()
        s["end"] = s["end"].isoformat()
        
    room = Room(
        college_id=uuid.UUID(college_id),
        name=room_in.name,
        location=room_in.location,
        capacity=room_in.capacity,
        availability_slots=slots_data
    )
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room

async def get_rooms_by_college(db: AsyncSession, college_id: str) -> List[Room]:
    stmt = select(Room).where(Room.college_id == uuid.UUID(college_id))
    result = await db.execute(stmt)
    return result.scalars().all()
