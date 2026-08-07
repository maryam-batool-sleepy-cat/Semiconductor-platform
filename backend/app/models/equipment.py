from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class EquipmentType(str, enum.Enum):
    LITHOGRAPHY = "lithography"
    ETCHING = "etching"
    DEPOSITION = "deposition"
    INSPECTION = "inspection"
    ION_IMPLANTATION = "ion_implantation"
    POLISHING = "polishing"

class EquipmentStatus(str, enum.Enum):
    OPERATIONAL = "operational"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"
    DEGRADED = "degraded"
    STANDBY = "standby"
    ENGINEERING = "engineering"

class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(Enum(EquipmentType), nullable=False)
    model = Column(String(50), nullable=True)
    manufacturer = Column(String(50), nullable=True)
    installation_date = Column(DateTime, nullable=True)
    operating_hours = Column(Float, default=0.0)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.OPERATIONAL)
    temperature = Column(Float, nullable=True)
    vibration = Column(Float, nullable=True)
    power_consumption = Column(Float, nullable=True)
    last_maintenance_date = Column(DateTime, nullable=True)
    next_maintenance_date = Column(DateTime, nullable=True)
    
    # ISA-95 Metrics
    uptime_hours = Column(Float, default=0.0)
    downtime_hours = Column(Float, default=0.0)
    scheduled_downtime_hours = Column(Float, default=0.0)
    unscheduled_downtime_hours = Column(Float, default=0.0)
    productive_time_hours = Column(Float, default=0.0)
    standby_time_hours = Column(Float, default=0.0)
    engineering_time_hours = Column(Float, default=0.0)
    total_time_hours = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    schedules = relationship("EquipmentSchedule", back_populates="equipment", cascade="all, delete-orphan")
    maintenance_records = relationship("Maintenance", back_populates="equipment", cascade="all, delete-orphan")
