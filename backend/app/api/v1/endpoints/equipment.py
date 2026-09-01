from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.core.database import get_db
from app.models.equipment import Equipment, EquipmentStatus, EquipmentType
from app.schemas.equipment import EquipmentCreate, EquipmentResponse
from app.core.security import verify_token
from sqlalchemy import func

router = APIRouter()

class UtilizationUpdate(BaseModel):
    hours: float

@router.post("/", response_model=EquipmentResponse, dependencies=[Depends(verify_token)])
def register_equipment(equipment: EquipmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Equipment).filter(Equipment.equipment_id == equipment.equipment_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Equipment ID already exists")
    
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

@router.get("/", response_model=List[EquipmentResponse], dependencies=[Depends(verify_token)])
def list_equipment(
    type: Optional[EquipmentType] = None,
    status: Optional[EquipmentStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Equipment)
    if type:
        query = query.filter(Equipment.type == type)
    if status:
        query = query.filter(Equipment.status == status)
    return query.all()

@router.get("/{equipment_id}/health", dependencies=[Depends(verify_token)])
def get_equipment_health(equipment_id: str, db: Session = Depends(get_db)):
    equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    health_score = 100
    alerts = []
    
    if equipment.operating_hours > 1000:
        health_score -= 10
        alerts.append("High operating hours detected")
    if equipment.operating_hours > 1200:
        health_score -= 15
        alerts.append("Critical operating hours - maintenance required")
    
    if equipment.temperature and equipment.temperature > 80:
        health_score -= 15
        alerts.append("Temperature exceeds recommended range")
    elif equipment.temperature and equipment.temperature > 70:
        health_score -= 5
        alerts.append("Temperature above normal")
    
    if equipment.vibration and equipment.vibration > 5.0:
        health_score -= 15
        alerts.append("Excessive vibration detected")
    elif equipment.vibration and equipment.vibration > 3.0:
        health_score -= 5
        alerts.append("Vibration above normal")
    
    total_time = equipment.total_time_hours or equipment.operating_hours + 100
    availability = round((equipment.uptime_hours / total_time) * 100, 2) if total_time > 0 else 0
    oee_score = round(health_score * (availability / 100), 2)
    
    status_value = "healthy" if health_score > 80 else "warning" if health_score > 60 else "critical"
    
    return {
        "equipment_id": equipment_id,
        "name": equipment.name,
        "status": equipment.status.value,
        "health_score": max(0, round(health_score, 2)),
        "status_level": status_value,
        "operating_hours": equipment.operating_hours,
        "temperature": equipment.temperature,
        "vibration": equipment.vibration,
        "power_consumption": equipment.power_consumption,
        "alerts": alerts,
        "recommendation": "Schedule maintenance" if health_score < 70 else "Normal operation",
        "availability": availability,
        "oee_score": oee_score,
        "uptime_hours": equipment.uptime_hours or 0,
        "downtime_hours": equipment.downtime_hours or 0,
        "last_maintenance": equipment.last_maintenance_date,
        "next_maintenance": equipment.next_maintenance_date
    }

@router.post("/{equipment_id}/utilization", dependencies=[Depends(verify_token)])
def update_utilization(
    equipment_id: str,
    utilization: UtilizationUpdate,
    db: Session = Depends(get_db)
):
    equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    equipment.operating_hours += utilization.hours
    equipment.uptime_hours = (equipment.uptime_hours or 0) + utilization.hours
    equipment.total_time_hours = (equipment.total_time_hours or 0) + utilization.hours
    equipment.updated_at = datetime.utcnow()
    
    if equipment.operating_hours > 1200:
        equipment.status = EquipmentStatus.MAINTENANCE
    elif equipment.operating_hours > 800:
        equipment.status = EquipmentStatus.DEGRADED
    
    db.commit()
    
    return {
        "equipment_id": equipment_id,
        "total_hours": round(equipment.operating_hours, 2),
        "utilization_rate": round((equipment.operating_hours / 720) * 100, 2),
        "uptime_hours": round(equipment.uptime_hours or 0, 2),
        "downtime_hours": round(equipment.downtime_hours or 0, 2)
    }

@router.get("/metrics/{equipment_id}", dependencies=[Depends(verify_token)])
def get_equipment_metrics(equipment_id: str, db: Session = Depends(get_db)):
    equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    total_time = equipment.total_time_hours or 1
    uptime_percentage = (equipment.uptime_hours / total_time) * 100 if total_time > 0 else 0
    downtime_percentage = (equipment.downtime_hours / total_time) * 100 if total_time > 0 else 0
    
    performance_efficiency = min(100, (equipment.uptime_hours / (total_time * 0.9)) * 100 if total_time > 0 else 0)
    quality_rate = 95.0
    oee_score = (uptime_percentage / 100) * (performance_efficiency / 100) * (quality_rate / 100) * 100
    
    return {
        "equipment_id": equipment_id,
        "name": equipment.name,
        "type": equipment.type.value,
        "status": equipment.status.value,
        "operating_hours": round(equipment.operating_hours, 2),
        "uptime_hours": round(equipment.uptime_hours or 0, 2),
        "downtime_hours": round(equipment.downtime_hours or 0, 2),
        "uptime_percentage": round(uptime_percentage, 2),
        "downtime_percentage": round(downtime_percentage, 2),
        "availability": round(uptime_percentage, 2),
        "performance_efficiency": round(performance_efficiency, 2),
        "quality_rate": round(quality_rate, 2),
        "oee_score": round(oee_score, 2),
        "temperature": equipment.temperature,
        "vibration": equipment.vibration,
        "health_score": round(100 - (equipment.operating_hours / 20), 2),
        "last_maintenance": equipment.last_maintenance_date,
        "next_maintenance": equipment.next_maintenance_date
    }

@router.get("/report", dependencies=[Depends(verify_token)])
def get_equipment_health_report(db: Session = Depends(get_db)):
    equipment_list = db.query(Equipment).all()
    
    total = len(equipment_list)
    operational = sum(1 for e in equipment_list if e.status == EquipmentStatus.OPERATIONAL)
    maintenance = sum(1 for e in equipment_list if e.status == EquipmentStatus.MAINTENANCE)
    degraded = sum(1 for e in equipment_list if e.status == EquipmentStatus.DEGRADED)
    offline = sum(1 for e in equipment_list if e.status == EquipmentStatus.OFFLINE)
    
    avg_uptime = sum(e.uptime_hours or 0 for e in equipment_list) / total if total > 0 else 0
    avg_downtime = sum(e.downtime_hours or 0 for e in equipment_list) / total if total > 0 else 0
    avg_operating_hours = sum(e.operating_hours or 0 for e in equipment_list) / total if total > 0 else 0
    avg_health = sum(100 - (e.operating_hours / 20) for e in equipment_list) / total if total > 0 else 0
    
    by_type = {}
    for eq in equipment_list:
        type_key = eq.type.value
        if type_key not in by_type:
            by_type[type_key] = {"total": 0, "operational": 0, "maintenance": 0}
        by_type[type_key]["total"] += 1
        if eq.status == EquipmentStatus.OPERATIONAL:
            by_type[type_key]["operational"] += 1
        elif eq.status == EquipmentStatus.MAINTENANCE:
            by_type[type_key]["maintenance"] += 1
    
    return {
        "summary": {
            "total_equipment": total,
            "operational_count": operational,
            "maintenance_count": maintenance,
            "degraded_count": degraded,
            "offline_count": offline,
            "utilization_rate": round((operational / total) * 100, 2) if total > 0 else 0
        },
        "metrics": {
            "avg_operating_hours": round(avg_operating_hours, 2),
            "avg_uptime_hours": round(avg_uptime, 2),
            "avg_downtime_hours": round(avg_downtime, 2),
            "avg_health_score": round(avg_health, 2),
            "overall_availability": round((avg_uptime / (avg_uptime + avg_downtime + 1)) * 100, 2)
        },
        "by_type": by_type,
        "critical_equipment": [
            {
                "equipment_id": e.equipment_id,
                "name": e.name,
                "operating_hours": round(e.operating_hours, 2),
                "status": e.status.value
            }
            for e in equipment_list if e.operating_hours > 800
        ],
        "timestamp": datetime.utcnow().isoformat()
    }
