"""
PlacementOps AI — Auth Router
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
import uuid

from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.college import College
from app.models.company import Company
from app.models import UserRole
from app.schemas.auth import (
    StudentRegister, CompanyRegister, UserLogin, Token, UserResponse, TokenData
)
from app.services.auth_service import (
    get_password_hash, verify_password, create_access_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register/student", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_student(user_data: StudentRegister, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Find college by domain
    result = await db.execute(select(College).where(College.domain == user_data.college_domain))
    college = result.scalars().first()
    if not college:
        raise HTTPException(status_code=400, detail="Invalid college domain")

    # Create user
    user = User(
        role=UserRole.STUDENT,
        org_id=college.college_id,
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        is_verified=True,  # Auto-verify students via domain
    )
    db.add(user)
    await db.flush()  # To get user_id

    # Create student profile
    student = Student(
        student_id=user.user_id,
        roll_no=user_data.roll_no,
        college_id=college.college_id,
        branch=user_data.branch,
        graduation_year=user_data.graduation_year
    )
    db.add(student)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/register/company", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_company(user_data: CompanyRegister, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create company
    company = Company(
        name=user_data.company_name
    )
    db.add(company)
    await db.flush()

    # Create user
    user = User(
        role=UserRole.COMPANY_RECRUITER,
        org_id=company.company_id,
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        is_verified=False,  # Needs college verification
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(login_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == login_data.username))
    user = result.scalars().first()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Note: Depending on your requirements, you might want to block unverified companies here
    if user.role == UserRole.COMPANY_RECRUITER and not user.is_verified:
        # In a real system, you might allow login but restrict actions.
        pass

    access_token = create_access_token(
        data={"sub": str(user.user_id), "role": user.role.value, "org_id": str(user.org_id) if user.org_id else None}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.user_id == uuid.UUID(current_user.user_id)))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
