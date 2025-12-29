from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import init_db
from app.core.qdrant import qdrant_service
from app.core.storage import storage_service
from app.api.v1 import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting CEO-OS API...")

    # Initialize database
    await init_db()
    logger.info("Database initialized")

    # Initialize Qdrant collection
    try:
        await qdrant_service.init_collection()
        logger.info("Qdrant collection initialized")
    except Exception as e:
        logger.warning(f"Qdrant initialization skipped: {e}")

    # Initialize storage bucket
    try:
        storage_service.init_bucket()
        logger.info("Storage bucket initialized")
    except Exception as e:
        logger.warning(f"Storage initialization skipped: {e}")

    yield

    # Shutdown
    logger.info("Shutting down CEO-OS API...")


app = FastAPI(
    title=settings.APP_NAME,
    description="CEO-OS: AI-powered Operating System for Small Business",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
