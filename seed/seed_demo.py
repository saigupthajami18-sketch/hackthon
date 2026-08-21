"""
PlacementOps AI — Seed Demo Data (§6.12 etc.)
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import async_session
from app.models.user import User
from app.models.student import Student
from app.models.college import College
from app.models.company import Company
from app.models import UserRole
from app.services.auth_service import get_password_hash
import random

async def seed_demo(db: AsyncSession):
    # 1. Create College
    college = College(name="Tech University", domain="tech.edu")
    db.add(college)
    await db.flush()
    
    # 2. Create College Admin
    admin = User(
        role=UserRole.COLLEGE_ADMIN,
        org_id=college.college_id,
        name="Admin User",
        email="admin@tech.edu",
        password_hash=get_password_hash("password123"),
        is_verified=True
    )
    db.add(admin)
    
    # 3. Create Companies
    companies = []
    for i in range(1, 6):
        c = Company(name=f"Company {i}", industry="Tech")
        db.add(c)
        await db.flush()
        companies.append(c)
        
        # Recruiter
        recruiter = User(
            role=UserRole.COMPANY_RECRUITER,
            org_id=c.company_id,
            name=f"Recruiter {i}",
            email=f"recruiter{i}@company{i}.com",
            password_hash=get_password_hash("password123"),
            is_verified=True
        )
        db.add(recruiter)
        
    # 4. Create Students (50)
    branches = ["CSE", "IT", "ECE"]
    for i in range(1, 51):
        user = User(
            role=UserRole.STUDENT,
            org_id=college.college_id,
            name=f"Student {i}",
            email=f"student{i}@tech.edu",
            password_hash=get_password_hash("password123"),
            is_verified=True
        )
        db.add(user)
        await db.flush()
        
        student = Student(
            student_id=user.user_id,
            roll_no=f"ROLL{str(i).zfill(3)}",
            college_id=college.college_id,
            branch=random.choice(branches),
            graduation_year=2027,
            cgpa=round(random.uniform(6.0, 9.5), 2),
            active_backlogs=random.choice([0, 0, 0, 1, 2])
        )
        db.add(student)
        
    await db.commit()
    print("Seeded demo data (1 college, 1 admin, 5 companies, 50 students).")

async def main():
    async with async_session() as session:
        await seed_demo(session)

if __name__ == "__main__":
    asyncio.run(main())
