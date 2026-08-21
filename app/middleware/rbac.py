"""
PlacementOps AI — RBAC Middleware
Provides a dependency to enforce role-based access control on routes.
"""

from fastapi import HTTPException, status, Depends
from typing import List, Callable
from app.services.auth_service import get_current_user
from app.schemas.auth import TokenData
from app.models import UserRole


def require_roles(allowed_roles: List[UserRole]) -> Callable:
    """
    Dependency factory to check if the current user's role is in the allowed_roles list.
    """
    async def role_checker(current_user: TokenData = Depends(get_current_user)):
        if UserRole(current_user.role) not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user
    return role_checker
