from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class ISA95Level(str, enum.Enum):
    LEVEL_0 = "level_0"
    LEVEL_1 = "level_1"
    LEVEL_2 = "level_2"
    LEVEL_3 = "level_3"
    LEVEL_4 = "level_4"
    LEVEL_5 = "level_5"

class EquipmentSchedule(Base):
    __tablename__ = "equipment_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    scheduled_start = Column(DateTime, nullable=False)
    scheduled_end = Column(DateTime, nullable=False)
    schedule_type = Column(String(50))
    status = Column(String(20), default="scheduled")
    is_scheduled_downtime = Column(Boolean, default=False)
    is_unscheduled_downtime = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    equipment = relationship("Equipment", back_populates="schedules")

class DailyTask(Base):
    __tablename__ = "daily_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String(200), nullable=False)
    description = Column(Text)
    assigned_to = Column(String(100))
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="pending")
    due_date = Column(DateTime)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    batch_id = Column(Integer, ForeignKey("wafer_batches.id"), nullable=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)

class GoalTracker(Base):
    __tablename__ = "goal_trackers"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_name = Column(String(200), nullable=False)
    description = Column(Text)
    target_value = Column(Float)
    current_value = Column(Float, default=0)
    unit = Column(String(20))
    deadline = Column(DateTime)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(50))
    quantity = Column(Integer, default=0)
    min_threshold = Column(Integer, default=10)
    max_threshold = Column(Integer, default=100)
    location = Column(String(100))
    supplier = Column(String(100))
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class DefectReport(Base):
    __tablename__ = "defect_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    wafer_id = Column(Integer, ForeignKey("wafers.id"))
    defect_type = Column(String(50))
    severity = Column(String(20))
    description = Column(Text)
    found_at_stage = Column(String(50))
    reported_by = Column(String(100))
    status = Column(String(20), default="open")
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    wafer = relationship("Wafer", back_populates="defect_reports")
