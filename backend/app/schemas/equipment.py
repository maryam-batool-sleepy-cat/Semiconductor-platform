from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.equipment import EquipmentType, EquipmentStatus

class EquipmentCreate(BaseModel):
    equipment_id: str = Field(..., min_length=3, max_length=20)
    name: str = Field(..., min_length=2, max_length=100)
    type: EquipmentType
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    installation_date: Optional[datetime] = None

class EquipmentResponse(BaseModel):
    id: int
    equipment_id: str
    name: str
    type: EquipmentType
    model: Optional[str]
    manufacturer: Optional[str]
    operating_hours: float
    status: EquipmentStatus
    temperature: Optional[float]
    vibration: Optional[float]
    
    class Config:
        from_attributes = True
