from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.maintenance import Maintenance
from app.models.equipment import Equipment, EquipmentStatus
from app.schemas.maintenance import MaintenanceCreate, MaintenanceResponse

router = APIRouter()

@router.post("/", response_model=MaintenanceResponse)
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
        cost=maintenance.cost
    )
    db.add(db_maintenance)
    equipment.status = EquipmentStatus.MAINTENANCE
    equipment.last_maintenance_date = maintenance.scheduled_date
    equipment.next_maintenance_date = maintenance.scheduled_date + timedelta(days=90)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

@router.get("/predictions")
def get_predictive_maintenance(db: Session = Depends(get_db)):
    """Analyze equipment and predict maintenance schedules"""
    equipment_list = db.query(Equipment).all()
    predictions = []
    
    for eq in equipment_list:
        if eq.operating_hours > 0:
            # Simple prediction based on operating hours
            if eq.operating_hours > 800:
                priority = "high" if eq.operating_hours > 1200 else "medium"
                days_until = max(0, 30 - ((eq.operating_hours - 800) / 20))
                
                predictions.append({
                    "equipment_id": eq.equipment_id,
                    "name": eq.name,
                    "current_operating_hours": round(eq.operating_hours, 2),
                    "threshold": 800,
                    "priority": priority,
                    "days_until_maintenance": round(days_until),
                    "recommended_action": "Schedule maintenance immediately" if priority == "high" 
                                         else "Plan maintenance in next 2 weeks"
                })
    
    return {
        "predictions": predictions,
        "total_predictions": len(predictions),
        "high_priority": sum(1 for p in predictions if p["priority"] == "high")
    }

@router.get("/alerts")
def get_maintenance_alerts(db: Session = Depends(get_db)):
    """Get active maintenance alerts"""
    equipment = db.query(Equipment).filter(
        Equipment.operating_hours > 1200,
        Equipment.status != EquipmentStatus.MAINTENANCE
    ).all()
    
    alerts = []
    for eq in equipment:
        alerts.append({
            "equipment_id": eq.equipment_id,
            "name": eq.name,
            "severity": "critical",
            "message": f"Equipment {eq.name} has exceeded 1200 operating hours",
            "timestamp": datetime.utcnow().isoformat()
        })
    
    return {"alerts": alerts, "count": len(alerts)}
