"""
PlacementOps AI — Offer Model (§6.18)
"""

from sqlalchemy import Column, String, Numeric, DateTime, Enum as SAEnum, ForeignKey, Uuid as UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.database import Base
from app.models import OfferStatus


class Offer(Base):
    __tablename__ = "offers"

    offer_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.application_id", ondelete="CASCADE"), nullable=False)
    
    offer_letter_url = Column(String(500), nullable=True)
    ctc_offered = Column(Numeric(12, 2), nullable=True)
    
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(SAEnum(OfferStatus, name="offer_status", create_constraint=True), default=OfferStatus.ISSUED)
    responded_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    application = relationship("Application", back_populates="offers")
