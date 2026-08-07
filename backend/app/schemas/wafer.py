from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.wafer import WaferStatus

class WaferCreate(BaseModel):
    wafer_id: str
    batch_id: int
    position: int

class WaferResponse(BaseModel):
    id: int
    wafer_id: str
    current_stage: WaferStatus
    position: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class BatchCreate(BaseModel):
    batch_name: str = Field(..., min_length=3, max_length=50)
    product_type: str = Field(..., min_length=2, max_length=50)
    total_wafers: int = Field(25, ge=1, le=100)

class BatchResponse(BaseModel):
    id: int
    batch_name: str
    product_type: str
    total_wafers: int
    created_at: datetime
    status: WaferStatus
    
    class Config:
        from_attributes = True
