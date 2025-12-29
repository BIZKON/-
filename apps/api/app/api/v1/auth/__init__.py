from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from typing import Optional

from app.core.database import get_db
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user_id
)
from app.core.config import settings
from app.models.user import User
from app.models.organization import Organization

router = APIRouter()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    organization_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    organization_id: Optional[str]

    class Config:
        from_attributes = True


@router.post("/register", response_model=Token)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create organization if provided
    organization_id = None
    if user_data.organization_name:
        org = Organization(name=user_data.organization_name)
        db.add(org)
        await db.flush()
        organization_id = org.id

    # Create user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        organization_id=organization_id
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Create token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return Token(access_token=access_token, token_type="bearer")


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        organization_id=str(user.organization_id) if user.organization_id else None
    )
