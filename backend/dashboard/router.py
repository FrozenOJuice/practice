import json
from fastapi import APIRouter, Depends, HTTPException, status
from backend.authentication.security import get_current_user
from backend.authentication.schemas import UserRole, TokenData
from backend.authentication import utils

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/user")
def get_user_dashboard(current_user: TokenData = Depends(get_current_user)):
    if current_user.role != UserRole.USER:
        raise HTTPException(status_code=403, detail="Only regular users can access this dashboard.")

    users = utils.load_users()
    user = next((u for u in users if u["user_id"] == current_user.user_id), None)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": user["username"],
        "role": user["role"],
        "transactions": user.get("transactions", []),
        "penalties": user.get("penalties", [])
    }

@router.get("/admin")
def get_admin_dashboard(current_user: TokenData = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access this dashboard.")

    users = utils.load_users()
    total_users = len(users)
    active_penalties = sum(len(u.get("penalties", [])) for u in users)

    return {
        "user_id": current_user.user_id,
        "role": current_user.role,
        "system_stats": {
            "total_users": total_users,
            "active_penalties": active_penalties,
        }
    }
