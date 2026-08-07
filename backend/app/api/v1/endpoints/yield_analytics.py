from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.yield_analytics import YieldData
from app.models.wafer import Wafer
from app.schemas.yield_analytics import YieldDataCreate, YieldResponse

router = APIRouter()

@router.post("/", response_model=YieldResponse)
def record_yield_data(yield_data: YieldDataCreate, db: Session = Depends(get_db)):
    """Record yield data for a wafer"""
    wafer = db.query(Wafer).filter(Wafer.id == yield_data.wafer_id).first()
    if not wafer:
        raise HTTPException(status_code=404, detail="Wafer not found")
    
    db_yield = YieldData(
        wafer_id=yield_data.wafer_id,
        process_stage=yield_data.process_stage,
        defect_count=yield_data.defect_count,
        yield_percentage=yield_data.yield_percentage,
        quality_score=yield_data.quality_score,
        parameters=yield_data.parameters
    )
    db.add(db_yield)
    db.commit()
    db.refresh(db_yield)
    return db_yield

@router.get("/analytics/trends")
def get_yield_trends(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get yield trends and analytics"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    yield_data = db.query(YieldData).filter(
        YieldData.inspection_date >= cutoff_date
    ).all()
    
    if not yield_data:
        return {
            "message": "No yield data available",
            "trend": "insufficient_data",
            "period_days": days,
            "total_records": 0
        }
    
    total_yield = sum(d.yield_percentage for d in yield_data) / len(yield_data)
    avg_defects = sum(d.defect_count for d in yield_data) / len(yield_data)
    avg_quality = sum(d.quality_score for d in yield_data) / len(yield_data)
    
    # Calculate defect rate by stage
    stage_defects = {}
    for data in yield_data:
        if data.process_stage not in stage_defects:
            stage_defects[data.process_stage] = {'defects': 0, 'count': 0}
        stage_defects[data.process_stage]['defects'] += data.defect_count
        stage_defects[data.process_stage]['count'] += 1
    
    stage_analysis = {}
    for stage, values in stage_defects.items():
        stage_analysis[stage] = round(values['defects'] / values['count'], 2)
    
    return {
        "period_days": days,
        "total_records": len(yield_data),
        "average_yield": round(total_yield, 2),
        "average_defects": round(avg_defects, 2),
        "average_quality": round(avg_quality, 2),
        "defect_rate_by_stage": stage_analysis,
        "trend": "improving" if total_yield > 90 else "stable" if total_yield > 80 else "declining"
    }

@router.get("/quality/report")
def get_quality_report(db: Session = Depends(get_db)):
    """Generate comprehensive quality report"""
    total_wafers = db.query(Wafer).count()
    
    recent_yield = db.query(YieldData).order_by(
        YieldData.inspection_date.desc()
    ).limit(100).all()
    
    yield_by_batch = db.query(
        Wafer.batch_id,
        func.avg(YieldData.yield_percentage).label('avg_yield'),
        func.avg(YieldData.quality_score).label('avg_quality'),
        func.sum(YieldData.defect_count).label('total_defects')
    ).join(YieldData, Wafer.id == YieldData.wafer_id).group_by(
        Wafer.batch_id
    ).all()
    
    return {
        "total_wafers": total_wafers,
        "analyzed_wafers": len(recent_yield),
        "overall_yield": round(sum(d.yield_percentage for d in recent_yield) / len(recent_yield), 2) if recent_yield else 0,
        "quality_score": round(sum(d.quality_score for d in recent_yield) / len(recent_yield), 2) if recent_yield else 0,
        "batch_performance": [
            {
                "batch_id": b.batch_id,
                "yield": round(b.avg_yield, 2) if b.avg_yield else 0,
                "quality": round(b.avg_quality, 2) if b.avg_quality else 0,
                "defects": b.total_defects or 0
            }
            for b in yield_by_batch
        ]
    }
