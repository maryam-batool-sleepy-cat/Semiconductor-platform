from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.equipment import Equipment, EquipmentStatus, EquipmentType
from app.schemas.equipment import EquipmentCreate, EquipmentResponse

router = APIRouter()

@router.post("/", response_model=EquipmentResponse)
def register_equipment(equipment: EquipmentCreate, db: Session = Depends(get_db)):
    """Register new fabrication equipment"""
    db_equipment = Equipment(
        equipment_id=equipment.equipment_id,
        name=equipment.name,
        type=equipment.type,
        model=equipment.model,
        manufacturer=equipment.manufacturer,
        installation_date=equipment.installation_date or datetime.utcnow()
    )
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.get("/", response_model=List[EquipmentResponse])
def list_equipment(
    type: Optional[EquipmentType] = None,
    status: Optional[EquipmentStatus] = None,
    db: Session = Depends(get_db)
):
    """List all equipment with optional filtering"""
    query = db.query(Equipment)
    if type:
        query = query.filter(Equipment.type == type)
    if status:
        query = query.filter(Equipment.status == status)
    return query.all()

@router.get("/{equipment_id}/health")
def get_equipment_health(equipment_id: str, db: Session = Depends(get_db)):
    """Get detailed equipment health status"""
    equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    health_score = 100
    alerts = []
    
    if equipment.operating_hours > 1000:
        health_score -= 10
        alerts.append("High operating hours detected")
    
    if equipment.temperature and equipment.temperature > 80:
        health_score -= 15
        alerts.append("Temperature exceeds recommended range")
    
    if equipment.vibration and equipment.vibration > 5.0:
        health_score -= 15
        alerts.append("Excessive vibration detected")
    
    status = "healthy" if health_score > 80 else "warning" if health_score > 60 else "critical"
    
    return {
        "equipment_id": equipment_id,
        "name": equipment.name,
        "status": equipment.status.value,
        "health_score": health_score,
        "operating_hours": equipment.operating_hours,
        "temperature": equipment.temperature,
        "vibration": equipment.vibration,
        "alerts": alerts,
        "recommendation": "Schedule maintenance" if health_score < 70 else "Normal operation"
    }

@router.post("/{equipment_id}/utilization")
def update_utilization(
    equipment_id: str,
    hours: float,
    db: Session = Depends(get_db)
):
    """Update equipment operating hours"""
    equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    equipment.operating_hours += hours
    equipment.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "equipment_id": equipment_id,
        "total_hours": equipment.operating_hours,
        "utilization": round(equipment.operating_hours / (24 * 30) * 100, 2)
    }
