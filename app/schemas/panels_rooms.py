from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models import PanelMemberType

class TimeSlot(BaseModel):
    start: datetime
    end: datetime

class PanelMember(BaseModel):
    user_id: UUID
    name: str
    role: str

class PanelCreate(BaseModel):
    name: str
    member_type: PanelMemberType
    members: List[PanelMember]
    availability_slots: Optional[List[TimeSlot]] = None

class PanelUpdate(BaseModel):
    name: Optional[str] = None
    member_type: Optional[PanelMemberType] = None
    members: Optional[List[PanelMember]] = None
    availability_slots: Optional[List[TimeSlot]] = None

class PanelResponse(BaseModel):
    panel_id: UUID
    drive_id: UUID
    name: str
    member_type: PanelMemberType
    members: List[PanelMember]
    availability_slots: Optional[List[TimeSlot]] = None

    class Config:
        from_attributes = True

class RoomCreate(BaseModel):
    name: str
    location: Optional[str] = None
    capacity: Optional[int] = None
    availability_slots: Optional[List[TimeSlot]] = None

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    availability_slots: Optional[List[TimeSlot]] = None

class RoomResponse(BaseModel):
    room_id: UUID
    college_id: UUID
    name: str
    location: Optional[str] = None
    capacity: Optional[int] = None
    availability_slots: Optional[List[TimeSlot]] = None

    class Config:
        from_attributes = True
