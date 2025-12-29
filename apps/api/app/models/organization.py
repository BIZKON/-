from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    industry = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    users = relationship("User", back_populates="organization")
    documents = relationship("Document", back_populates="organization")
