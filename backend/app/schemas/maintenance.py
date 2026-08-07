from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class MaintenanceCreate(BaseModel):
    equipment_id: int
    maintenance_type: str
    scheduled_date: datetime
    description: str
    technician: str
    cost: float = 0.0

class MaintenanceResponse(BaseModel):
    id: int
    equipment_id: int
    maintenance_type: str
    scheduled_date: datetime
    completed_date: Optional[datetime]
    description: str
    status: str
    
    class Config:
        from_attributes = True
