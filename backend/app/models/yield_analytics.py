from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class YieldData(Base):
    __tablename__ = "yield_data"
    
    id = Column(Integer, primary_key=True, index=True)
    wafer_id = Column(Integer, ForeignKey("wafers.id"))
    process_stage = Column(String(50))
    defect_count = Column(Integer, default=0)
    yield_percentage = Column(Float)
    quality_score = Column(Float)
    inspection_date = Column(DateTime, default=datetime.utcnow)
    parameters = Column(Text, nullable=True)
    
    wafer = relationship("Wafer", back_populates="yield_data")
