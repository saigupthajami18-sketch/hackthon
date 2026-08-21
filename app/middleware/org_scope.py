"""
PlacementOps AI — Org Scoping Middleware
Provides helper functions to filter SQLAlchemy queries based on the user's role and org_id.
"""

from sqlalchemy.sql import Select
from app.schemas.auth import TokenData
from app.models import UserRole
from fastapi import HTTPException, status


def apply_org_scope(query: Select, current_user: TokenData, model) -> Select:
    """
    Applies an org_id filter to a SQLAlchemy select query depending on the user's role.
    Assumes the model has `college_id`, `company_id`, or `student_id` fields depending on context.
    """
    if current_user.role == UserRole.COLLEGE_ADMIN:
        # College admins can only see data belonging to their college
        if hasattr(model, 'college_id'):
            return query.filter(model.college_id == current_user.org_id)
        # If model is student, filter by college_id
        if hasattr(model, 'student_id') and not hasattr(model, 'college_id'):
             # This requires join logic if college_id isn't directly on the model, handled in specific services
             pass
    
    elif current_user.role == UserRole.COMPANY_RECRUITER:
        # Company recruiters can only see data belonging to their company
        if hasattr(model, 'company_id'):
            return query.filter(model.company_id == current_user.org_id)
            
    elif current_user.role == UserRole.STUDENT:
        # Students can only see their own data
        if hasattr(model, 'student_id'):
            return query.filter(model.student_id == current_user.user_id)
            
    return query

def verify_org_access(resource_org_id: str, current_user: TokenData):
    """
    Raises 403 Forbidden if the user's org_id doesn't match the resource's org_id.
    """
    if current_user.role in [UserRole.COLLEGE_ADMIN, UserRole.COMPANY_RECRUITER]:
        if str(resource_org_id) != str(current_user.org_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this resource."
            )
