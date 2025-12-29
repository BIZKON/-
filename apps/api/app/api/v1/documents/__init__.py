from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.core.storage import storage_service
from app.core.qdrant import qdrant_service
from app.models.document import Document
from app.models.user import User
from app.services.document_processor import process_document
from app.services.embedding import embedding_service

router = APIRouter()


class DocumentResponse(BaseModel):
    id: str
    title: str
    doc_type: str
    status: str
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


async def process_document_background(
    document_id: str,
    file_data: bytes,
    filename: str,
    organization_id: str,
    db_url: str
):
    """Background task to process document and create embeddings."""
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker

    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            # Process document
            text, chunks = process_document(file_data, filename)

            # Generate embeddings
            embeddings = await embedding_service.embed_texts(chunks)

            # Store in Qdrant
            ids = [str(uuid.uuid4()) for _ in chunks]
            payloads = [
                {
                    "organization_id": organization_id,
                    "document_id": document_id,
                    "content": chunk,
                    "chunk_index": i
                }
                for i, chunk in enumerate(chunks)
            ]

            qdrant_service.upsert_documents(ids, embeddings, payloads)

            # Update document status
            result = await session.execute(
                select(Document).where(Document.id == document_id)
            )
            doc = result.scalar_one_or_none()
            if doc:
                doc.status = "ready"
                doc.chunk_count = len(chunks)
                await session.commit()

        except Exception as e:
            # Update document status to error
            result = await session.execute(
                select(Document).where(Document.id == document_id)
            )
            doc = result.scalar_one_or_none()
            if doc:
                doc.status = "error"
                await session.commit()
            raise

    await engine.dispose()


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Get user's organization
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.organization_id:
        return DocumentListResponse(documents=[], total=0)

    # Get documents
    result = await db.execute(
        select(Document)
        .where(Document.organization_id == user.organization_id)
        .order_by(Document.created_at.desc())
    )
    documents = result.scalars().all()

    return DocumentListResponse(
        documents=[
            DocumentResponse(
                id=str(doc.id),
                title=doc.title,
                doc_type=doc.doc_type,
                status=doc.status,
                chunk_count=doc.chunk_count,
                created_at=doc.created_at
            )
            for doc in documents
        ],
        total=len(documents)
    )


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    title: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.txt']
    file_ext = '.' + file.filename.split('.')[-1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not supported. Allowed: {allowed_extensions}"
        )

    # Validate doc_type
    allowed_types = ['strategy', 'okr', 'finance', 'process', 'other']
    if doc_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document type not supported. Allowed: {allowed_types}"
        )

    # Get user's organization
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization"
        )

    # Read file
    file_data = await file.read()

    # Upload to storage
    object_name = f"{user.organization_id}/{uuid.uuid4()}{file_ext}"
    file_url = storage_service.upload_file(
        file_data,
        object_name,
        file.content_type or "application/octet-stream"
    )

    # Create document record
    doc = Document(
        organization_id=user.organization_id,
        title=title or file.filename,
        doc_type=doc_type,
        file_url=file_url,
        status="processing"
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Process document in background
    from app.core.config import settings
    background_tasks.add_task(
        process_document_background,
        str(doc.id),
        file_data,
        file.filename,
        str(user.organization_id),
        settings.DATABASE_URL
    )

    return DocumentResponse(
        id=str(doc.id),
        title=doc.title,
        doc_type=doc.doc_type,
        status=doc.status,
        chunk_count=doc.chunk_count,
        created_at=doc.created_at
    )


@router.get("/{document_id}/status")
async def get_document_status(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    return {"status": doc.status, "chunk_count": doc.chunk_count}


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Delete from Qdrant
    qdrant_service.delete_by_document_id(document_id)

    # Delete from storage
    if doc.file_url:
        object_name = doc.file_url.split('/', 1)[1] if '/' in doc.file_url else doc.file_url
        storage_service.delete_file(object_name)

    # Delete from database
    await db.delete(doc)
    await db.commit()

    return {"message": "Document deleted successfully"}
