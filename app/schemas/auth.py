"""
PlacementOps AI — Auth Schemas
"""

from pydantic import BaseModel, EmailStr, UUID4, Field
from typing import Optional
from app.models import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: str
    role: str
    org_id: Optional[str] = None


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=8)


class StudentRegister(UserCreate):
    roll_no: str
    college_domain: str  # E.g., "university.edu" - to auto-link to a College
    branch: str
    graduation_year: int


class CompanyRegister(UserCreate):
    company_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    user_id: UUID4
    name: str
    email: EmailStr
    role: UserRole
    org_id: Optional[UUID4]
    is_verified: bool

    class Config:
        from_attributes = True
