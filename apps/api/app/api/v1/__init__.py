from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.documents import router as documents_router
from app.api.v1.agents import router as agents_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(documents_router, prefix="/documents", tags=["documents"])
api_router.include_router(agents_router, prefix="/agents", tags=["agents"])
