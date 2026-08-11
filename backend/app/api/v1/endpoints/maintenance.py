from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.core.database import get_db
from app.models.maintenance import Maintenance
from app.models.equipment import Equipment, EquipmentStatus
import random
import json

router = APIRouter()

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

@router.get("/predictions")
def get_predictive_maintenance(db: Session = Depends(get_db)):
    """Analyze equipment and predict maintenance schedules"""
    equipment_list = db.query(Equipment).all()
    predictions = []
    
    for eq in equipment_list:
        if eq.operating_hours > 0:
            # More detailed prediction based on operating hours
            if eq.operating_hours > 1200:
                priority = "critical"
                days_until = 0
                recommended_action = "Schedule maintenance immediately - CRITICAL"
                color = "#ff1744"
            elif eq.operating_hours > 800:
                priority = "high"
                days_until = max(0, 30 - ((eq.operating_hours - 800) / 15))
                recommended_action = "Schedule maintenance within 48 hours"
                color = "#ff9100"
            elif eq.operating_hours > 500:
                priority = "medium"
                days_until = max(0, 60 - ((eq.operating_hours - 500) / 10))
                recommended_action = "Plan maintenance in next 2 weeks"
                color = "#ffea00"
            else:
                priority = "low"
                days_until = max(0, 90 - ((eq.operating_hours - 200) / 5))
                recommended_action = "Monitor - no immediate action needed"
                color = "#00e676"
            
            predictions.append({
                "equipment_id": eq.equipment_id,
                "name": eq.name,
                "type": eq.type.value,
                "current_operating_hours": round(eq.operating_hours, 2),
                "threshold": 800,
                "priority": priority,
                "priority_color": color,
                "days_until_maintenance": round(days_until),
                "recommended_action": recommended_action,
                "temperature": eq.temperature or 0,
                "vibration": eq.vibration or 0,
                "status": eq.status.value,
                "health_score": max(0, 100 - (eq.operating_hours / 20))
            })
    
    return {
        "predictions": predictions,
        "total_predictions": len(predictions),
        "critical": sum(1 for p in predictions if p["priority"] == "critical"),
        "high": sum(1 for p in predictions if p["priority"] == "high"),
        "medium": sum(1 for p in predictions if p["priority"] == "medium"),
        "low": sum(1 for p in predictions if p["priority"] == "low"),
    }

@router.get("/alerts")
def get_maintenance_alerts(db: Session = Depends(get_db)):
    """Get active maintenance alerts"""
    # Get equipment that needs immediate attention
    critical_equipment = db.query(Equipment).filter(
        Equipment.operating_hours > 1200,
        Equipment.status != EquipmentStatus.MAINTENANCE
    ).all()
    
    high_priority_equipment = db.query(Equipment).filter(
        Equipment.operating_hours > 800,
        Equipment.operating_hours <= 1200,
        Equipment.status != EquipmentStatus.MAINTENANCE
    ).all()
    
    alerts = []
    
    for eq in critical_equipment:
        alerts.append({
            "equipment_id": eq.equipment_id,
            "name": eq.name,
            "severity": "critical",
            "message": f"⚠️ CRITICAL: {eq.name} has exceeded 1200 operating hours. Immediate maintenance required!",
            "timestamp": datetime.utcnow().isoformat(),
            "operating_hours": round(eq.operating_hours, 2)
        })
    
    for eq in high_priority_equipment:
        alerts.append({
            "equipment_id": eq.equipment_id,
            "name": eq.name,
            "severity": "high",
            "message": f"⚡ HIGH: {eq.name} has exceeded 800 operating hours. Schedule maintenance soon.",
            "timestamp": datetime.utcnow().isoformat(),
            "operating_hours": round(eq.operating_hours, 2)
        })
    
    return {"alerts": alerts, "count": len(alerts)}

@router.post("/schedule")
def schedule_maintenance(maintenance: MaintenanceCreate, db: Session = Depends(get_db)):
    """Schedule maintenance for equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == maintenance.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    db_maintenance = Maintenance(
        equipment_id=maintenance.equipment_id,
        maintenance_type=maintenance.maintenance_type,
        scheduled_date=maintenance.scheduled_date,
        description=maintenance.description,
        technician=maintenance.technician,
        cost=maintenance.cost,
        status="scheduled"
    )
    db.add(db_maintenance)
    equipment.status = EquipmentStatus.MAINTENANCE
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

@router.get("/history")
def get_maintenance_history(
    equipment_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get maintenance history"""
    query = db.query(Maintenance)
    if equipment_id:
        query = query.filter(Maintenance.equipment_id == equipment_id)
    return query.order_by(Maintenance.scheduled_date.desc()).all()

@router.post("/complete/{maintenance_id}")
def complete_maintenance(maintenance_id: int, db: Session = Depends(get_db)):
    """Mark maintenance as completed"""
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    
    maintenance.status = "completed"
    maintenance.completed_date = datetime.utcnow()
    
    # Update equipment status
    equipment = db.query(Equipment).filter(Equipment.id == maintenance.equipment_id).first()
    if equipment:
        equipment.status = EquipmentStatus.OPERATIONAL
        equipment.last_maintenance_date = datetime.utcnow()
        equipment.next_maintenance_date = datetime.utcnow() + timedelta(days=90)
        equipment.operating_hours = 0
    
    db.commit()
    return {"message": "Maintenance completed successfully"}

@router.get("/executive-report")
def get_executive_maintenance_report(db: Session = Depends(get_db)):
    """Generate executive maintenance report"""
    total_equipment = db.query(Equipment).count()
    operational = db.query(Equipment).filter(Equipment.status == EquipmentStatus.OPERATIONAL).count()
    maintenance_needed = db.query(Equipment).filter(Equipment.operating_hours > 800).count()
    
    # Get all maintenance records
    all_maintenance = db.query(Maintenance).all()
    total_maintenance = len(all_maintenance)
    scheduled = sum(1 for m in all_maintenance if m.status == "scheduled")
    completed = sum(1 for m in all_maintenance if m.status == "completed")
    
    # Calculate average cost
    avg_cost = db.query(func.avg(Maintenance.cost)).scalar() or 0
    
    # Get recent maintenance (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent = db.query(Maintenance).filter(Maintenance.scheduled_date >= thirty_days_ago).count()
    
    # Get equipment with most maintenance
    equipment_maintenance = db.query(
        Maintenance.equipment_id,
        func.count(Maintenance.id).label('count')
    ).group_by(Maintenance.equipment_id).order_by(func.count(Maintenance.id).desc()).limit(5).all()
    
    most_maintained = []
    for item in equipment_maintenance:
        eq = db.query(Equipment).filter(Equipment.id == item.equipment_id).first()
        if eq:
            most_maintained.append({
                "name": eq.name,
                "count": item.count
            })
    
    return {
        "total_equipment": total_equipment,
        "operational": operational,
        "maintenance_needed": maintenance_needed,
        "utilization_rate": round((operational / total_equipment) * 100, 2) if total_equipment > 0 else 0,
        "total_maintenance_records": total_maintenance,
        "scheduled_maintenance": scheduled,
        "completed_maintenance": completed,
        "avg_maintenance_cost": round(avg_cost, 2),
        "recent_maintenance_30d": recent,
        "most_maintained_equipment": most_maintained,
        "equipment_health_status": {
            "critical": db.query(Equipment).filter(Equipment.operating_hours > 1200).count(),
            "high": db.query(Equipment).filter(Equipment.operating_hours > 800, Equipment.operating_hours <= 1200).count(),
            "medium": db.query(Equipment).filter(Equipment.operating_hours > 500, Equipment.operating_hours <= 800).count(),
            "low": db.query(Equipment).filter(Equipment.operating_hours <= 500).count(),
        }
    }

# Add missing import for func
from sqlalchemy import func
