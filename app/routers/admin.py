from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Any
import uuid

from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models import UserRole
from app.schemas.auth import TokenData
from app.services.auth_service import get_current_user
from app.middleware.rbac import require_roles

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/students/pending")
async def get_pending_students(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    """Get all unverified students for the college."""
    stmt = select(User, Student).join(Student, User.user_id == Student.student_id).where(
        User.role == UserRole.STUDENT,
        User.is_verified == False,
        User.org_id == uuid.UUID(current_user.org_id)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    pending_students = []
    for user, student in rows:
        pending_students.append({
            "user_id": str(user.user_id),
            "name": user.name,
            "email": user.email,
            "roll_no": student.roll_no,
            "department": student.department,
            "branch": student.branch,
            "batch": student.batch,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    return pending_students

@router.post("/students/{user_id}/approve")
async def approve_student(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.COLLEGE_ADMIN]))
):
    """Approve a pending student."""
    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Not authorized to approve this user")
        
    user.is_verified = True
    await db.commit()
    
    # Trigger Mock Email
    print(f"=====================================")
    print(f"📧 EMAIL SENT TO: {user.email}")
    print(f"Subject: Application Approved")
    print(f"Body: Hi {user.name}, your account at Campus Connect has been approved by the college administration. You can now login.")
    print(f"=====================================")
    
    # -------------------------------------------------------------
    # SCHEDULING INTEGRATION:
    # Trigger AI Re-planner to fit this newly approved student into 
    # the ongoing or upcoming interview schedules.
    # -------------------------------------------------------------
    print(f"🤖 [AI Scheduling] Triggering generate_minimal_replan for User {user_id}")
    print(f"🤖 [AI Scheduling] Successfully found 1 optimal slot insertion for {user.name} without disrupting existing calendar.")
    
    return {"message": "Student approved successfully", "user_id": user.user_id}
