from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    style_preferences = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="users")
    conversations = relationship("Conversation", back_populates="user")
