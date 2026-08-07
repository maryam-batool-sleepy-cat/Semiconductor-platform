from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Maintenance(Base):
    __tablename__ = "maintenance"
    
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    maintenance_type = Column(String(50))
    scheduled_date = Column(DateTime)
    completed_date = Column(DateTime, nullable=True)
    technician = Column(String(100))
    description = Column(Text)
    cost = Column(Float, default=0.0)
    status = Column(String(20), default="scheduled")
    
    equipment = relationship("Equipment", back_populates="maintenance_records")
