from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class WaferStatus(str, enum.Enum):
    REGISTERED = "registered"
    IN_PRODUCTION = "in_production"
    LITHOGRAPHY = "lithography"
    ETCHING = "etching"
    DEPOSITION = "deposition"
    INSPECTION = "inspection"
    COMPLETED = "completed"
    REJECTED = "rejected"

class WaferBatch(Base):
    __tablename__ = "wafer_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_name = Column(String(50), unique=True, nullable=False)
    product_type = Column(String(50))
    total_wafers = Column(Integer, default=25)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(WaferStatus), default=WaferStatus.REGISTERED)
    
    wafers = relationship("Wafer", back_populates="batch", cascade="all, delete-orphan")

class Wafer(Base):
    __tablename__ = "wafers"
    
    id = Column(Integer, primary_key=True, index=True)
    wafer_id = Column(String(20), unique=True, nullable=False)
    batch_id = Column(Integer, ForeignKey("wafer_batches.id"))
    current_stage = Column(Enum(WaferStatus), default=WaferStatus.REGISTERED)
    position = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    batch = relationship("WaferBatch", back_populates="wafers")
    yield_data = relationship("YieldData", back_populates="wafer", cascade="all, delete-orphan")
    defect_reports = relationship("DefectReport", back_populates="wafer", cascade="all, delete-orphan")
