from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.core.database import get_db
from app.models.maintenance import Maintenance
from app.models.equipment import Equipment, EquipmentStatus
from app.services.ml_model import predictor
from app.services.predictive_maintenance import maintenance_service
from sqlalchemy import func

router = APIRouter()

class MaintenanceCreate(BaseModel):
    equipment_id: int
    maintenance_type: str
    scheduled_date: datetime
    description: str
    technician: str
    cost: float = 0.0

@router.get("/predictions")
def get_predictive_maintenance(db: Session = Depends(get_db)):
    """Get ML-based maintenance predictions"""
    try:
        equipment_list = db.query(Equipment).all()
        maintenance_records = db.query(Maintenance).all()
        
        # Train ML model if we have enough data
        if len(equipment_list) > 3:
            training_data = []
            for eq in equipment_list:
                maint_count = sum(1 for m in maintenance_records if m.equipment_id == eq.id)
                training_data.append({
                    'operating_hours': eq.operating_hours or 0,
                    'temperature': eq.temperature or 25,
                    'vibration': eq.vibration or 0.5,
                    'age_days': 30,
                    'maintenance_count': maint_count,
                    'failed': 1 if (eq.operating_hours or 0) > 1200 else 0
                })
            predictor.train(training_data)
        
        predictions = []
        for eq in equipment_list:
            try:
                analysis = maintenance_service.analyze_equipment_health(eq)
                predictions.append(analysis)
            except Exception as e:
                logger.error(f"Error analyzing {eq.equipment_id}: {e}")
                # Add fallback prediction
                predictions.append({
                    "equipment_id": eq.equipment_id,
                    "name": eq.name,
                    "health_score": 85.0,
                    "failure_probability": 15.0,
                    "status": "healthy",
                    "recommended_action": "Monitor regularly",
                    "priority": "low",
                    "days_until_maintenance": 30,
                    "operating_hours": eq.operating_hours or 0,
                    "temperature": eq.temperature or 0,
                    "vibration": eq.vibration or 0
                })
        
        return {
            "predictions": predictions,
            "total_predictions": len(predictions),
            "critical": sum(1 for p in predictions if p.get("priority") == "urgent"),
            "high": sum(1 for p in predictions if p.get("priority") == "high"),
            "medium": sum(1 for p in predictions if p.get("priority") == "medium"),
            "low": sum(1 for p in predictions if p.get("priority") == "low"),
            "kpis": maintenance_service.get_maintenance_kpis(equipment_list, maintenance_records)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
def get_maintenance_alerts(db: Session = Depends(get_db)):
    """Get ML-based maintenance alerts"""
    try:
        equipment_list = db.query(Equipment).all()
        alerts = []
        
        for eq in equipment_list:
            try:
                analysis = maintenance_service.analyze_equipment_health(eq)
                if analysis.get('priority') in ['urgent', 'high']:
                    alerts.append({
                        "equipment_id": eq.equipment_id,
                        "name": eq.name,
                        "severity": analysis.get('priority', 'low'),
                        "message": f"{analysis.get('status', 'unknown').upper()}: {eq.name} needs maintenance. Failure probability: {analysis.get('failure_probability', 0)}%",
                        "timestamp": datetime.utcnow().isoformat(),
                        "health_score": analysis.get('health_score', 0),
                        "recommended_action": analysis.get('recommended_action', 'Monitor')
                    })
            except Exception as e:
                logger.error(f"Error getting alerts for {eq.equipment_id}: {e}")
                continue
        
        return {"alerts": alerts, "count": len(alerts)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/schedule")
def schedule_maintenance(maintenance: MaintenanceCreate, db: Session = Depends(get_db)):
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
    query = db.query(Maintenance)
    if equipment_id:
        query = query.filter(Maintenance.equipment_id == equipment_id)
    return query.order_by(Maintenance.scheduled_date.desc()).all()

@router.post("/complete/{maintenance_id}")
def complete_maintenance(maintenance_id: int, db: Session = Depends(get_db)):
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    
    maintenance.status = "completed"
    maintenance.completed_date = datetime.utcnow()
    
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
    total_equipment = db.query(Equipment).count()
    operational = db.query(Equipment).filter(Equipment.status == EquipmentStatus.OPERATIONAL).count()
    maintenance_needed = db.query(Equipment).filter(Equipment.operating_hours > 800).count()
    
    all_maintenance = db.query(Maintenance).all()
    total_maintenance = len(all_maintenance)
    scheduled = sum(1 for m in all_maintenance if m.status == "scheduled")
    completed = sum(1 for m in all_maintenance if m.status == "completed")
    
    avg_cost = db.query(func.avg(Maintenance.cost)).scalar() or 0
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent = db.query(Maintenance).filter(Maintenance.scheduled_date >= thirty_days_ago).count()
    
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
        "equipment_health_status": {
            "critical": db.query(Equipment).filter(Equipment.operating_hours > 1200).count(),
            "high": db.query(Equipment).filter(Equipment.operating_hours > 800, Equipment.operating_hours <= 1200).count(),
            "medium": db.query(Equipment).filter(Equipment.operating_hours > 500, Equipment.operating_hours <= 800).count(),
            "low": db.query(Equipment).filter(Equipment.operating_hours <= 500).count(),
        }
    }
