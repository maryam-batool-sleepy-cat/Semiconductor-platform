from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.wafer import Wafer, WaferBatch, WaferStatus
from app.models.equipment import Equipment, EquipmentStatus
from app.models.yield_analytics import YieldData
from app.models.maintenance import Maintenance

router = APIRouter()

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """Get comprehensive dashboard overview data"""
    
    # Wafer metrics
    total_wafers = db.query(Wafer).count()
    active_wafers = db.query(Wafer).filter(
        Wafer.current_stage != WaferStatus.COMPLETED,
        Wafer.current_stage != WaferStatus.REJECTED
    ).count()
    completed_wafers = db.query(Wafer).filter(
        Wafer.current_stage == WaferStatus.COMPLETED
    ).count()
    
    yesterday = datetime.utcnow() - timedelta(days=1)
    throughput = db.query(Wafer).filter(
        Wafer.updated_at >= yesterday,
        Wafer.current_stage == WaferStatus.COMPLETED
    ).count()
    
    # Equipment metrics
    total_equipment = db.query(Equipment).count()
    operational_equipment = db.query(Equipment).filter(
        Equipment.status == EquipmentStatus.OPERATIONAL
    ).count()
    maintenance_needed = db.query(Equipment).filter(
        Equipment.operating_hours > 800
    ).count()
    
    # Yield metrics - FIXED: Calculate from actual data
    avg_yield = db.query(func.avg(YieldData.yield_percentage)).scalar() or 0
    latest_yield = db.query(YieldData).order_by(
        YieldData.inspection_date.desc()
    ).first()
    avg_defects = db.query(func.avg(YieldData.defect_count)).scalar() or 0
    quality_score = db.query(func.avg(YieldData.quality_score)).scalar() or 0
    
    # Maintenance metrics
    pending_maintenance = db.query(Maintenance).filter(
        Maintenance.status == "scheduled"
    ).count()
    alerts_generated = db.query(Maintenance).filter(
        Maintenance.status == "scheduled",
        Maintenance.scheduled_date <= datetime.utcnow()
    ).count()
    
    return {
        "wafer_metrics": {
            "total_wafers": total_wafers,
            "active_wafers": active_wafers,
            "completed_wafers": completed_wafers,
            "throughput_24h": throughput
        },
        "equipment_metrics": {
            "total_equipment": total_equipment,
            "operational": operational_equipment,
            "maintenance_needed": maintenance_needed,
            "utilization_rate": round((operational_equipment / total_equipment) * 100, 2) if total_equipment > 0 else 0
        },
        "quality_metrics": {
            "average_yield": round(float(avg_yield), 2),
            "latest_yield": round(float(latest_yield.yield_percentage), 2) if latest_yield else 0,
            "average_defects": round(float(avg_defects), 2),
            "quality_score": round(float(quality_score), 2)
        },
        "maintenance_metrics": {
            "pending_maintenance": pending_maintenance,
            "alerts_generated": alerts_generated,
            "completed": db.query(Maintenance).filter(Maintenance.status == "completed").count()
        },
        "timestamp": datetime.utcnow().isoformat()
    }
