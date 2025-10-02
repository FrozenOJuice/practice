# router.py - Update login and add refresh endpoint
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from backend.authentication import schemas, utils, security
import os, uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post('/register', response_model=schemas.UserResponse)
async def register(user: schemas.UserCreate):
    users = utils.load_users()
    exists, message = utils.user_exists(users, user.username, user.email)
    if exists:
        raise HTTPException(status_code=400, detail=message)
    
    new_user = {
        "id": str(uuid.uuid4()),
        "username": user.username,
        "email": user.email,
        "hashed_password": security.hash_password(user.password),
        "role": user.role.value,
        "penalties": [],
        "transactions": [],
        "refresh_tokens": [] 
    }

    users.append(new_user)
    utils.save_users(users)

    return {
        "user_id": new_user["id"],
        "username": new_user["username"],
        "email": new_user["email"],
        "role": new_user["role"],
        "penalties": new_user["penalties"],
        "transactions": new_user["transactions"]
    }

@router.post('/login', response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    users = utils.load_users()
    user = next((u for u in users if u["username"] == form_data.username), None)

    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Create both access and refresh tokens
    access_token = security.create_access_token(
        data={"sub": user["id"], "role": user["role"]}
    )
    
    refresh_token = security.create_refresh_token(
        data={"sub": user["id"]}
    )
    
    # Store refresh token in user data (optional - for token revocation)
    user["refresh_tokens"] = user.get("refresh_tokens", []) + [refresh_token]
    utils.save_users(users)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token, 
        "token_type": "bearer",
    }

@router.post('/refresh', response_model=schemas.Token)
async def refresh_token(token_data: schemas.TokenRefresh):
    payload = security.verify_refresh_token(token_data.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    users = utils.load_users()
    user = next((u for u in users if u["id"] == user_id), None)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Optional: Check if refresh token is in user's valid tokens list
    if token_data.refresh_token not in user.get("refresh_tokens", []):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked"
        )
    
    # Create new access token
    new_access_token = security.create_access_token(
        data={"sub": user["id"], "role": user["role"]}
    )
    
    # Optionally create new refresh token (rotate refresh tokens)
    new_refresh_token = security.create_refresh_token(
        data={"sub": user["id"]}
    )
    
    # Update user's refresh tokens
    user["refresh_tokens"] = [new_refresh_token]  # Replace old with new
    utils.save_users(users)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }

@router.post('/logout')
async def logout(token_data: schemas.TokenRefresh):
    """Revoke a refresh token"""
    payload = security.verify_refresh_token(token_data.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    users = utils.load_users()
    user = next((u for u in users if u["id"] == user_id), None)
    
    if user and token_data.refresh_token in user.get("refresh_tokens", []):
        # Remove the specific refresh token
        user["refresh_tokens"].remove(token_data.refresh_token)
        utils.save_users(users)
    
    return {"message": "Successfully logged out"}