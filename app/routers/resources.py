from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.database import get_db
from app.models import UserRole
from app.models.job_drive import JobDrive
from app.models.panel import Panel
from app.models.room import Room
from app.schemas.auth import TokenData
from app.middleware.rbac import require_roles
from app.middleware.org_scope import verify_org_access
from app.schemas.panels_rooms import PanelCreate, PanelResponse, RoomCreate, RoomResponse
from app.services.resource_service import create_panel, get_panels_by_drive, create_room, get_rooms_by_college

router = APIRouter(tags=["Resources"])

@router.post("/drives/{drive_id}/panels", response_model=PanelResponse)
async def add_panel(
    drive_id: str,
    panel_in: PanelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(drive.college_id, current_user)
    
    panel = await create_panel(db, drive_id, panel_in)
    return panel

@router.get("/drives/{drive_id}/panels", response_model=List[PanelResponse])
async def list_panels(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]))
):
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    verify_org_access(
        drive.company_id if current_user.role == UserRole.COMPANY_RECRUITER else drive.college_id, 
        current_user
    )
    
    panels = await get_panels_by_drive(db, drive_id)
    return panels

@router.post("/colleges/{college_id}/rooms", response_model=RoomResponse)
async def add_room(
    college_id: str,
    room_in: RoomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    verify_org_access(uuid.UUID(college_id), current_user)
    room = await create_room(db, college_id, room_in)
    return room

@router.get("/colleges/{college_id}/rooms", response_model=List[RoomResponse])
async def list_rooms(
    college_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    verify_org_access(uuid.UUID(college_id), current_user)
    rooms = await get_rooms_by_college(db, college_id)
    return rooms
