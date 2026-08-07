from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class YieldDataCreate(BaseModel):
    wafer_id: int
    process_stage: str
    defect_count: int = 0
    yield_percentage: float = Field(..., ge=0, le=100)
    quality_score: float = Field(..., ge=0, le=100)
    parameters: Optional[str] = None

class YieldResponse(BaseModel):
    id: int
    wafer_id: int
    process_stage: str
    defect_count: int
    yield_percentage: float
    quality_score: float
    inspection_date: datetime
    
    class Config:
        from_attributes = True
