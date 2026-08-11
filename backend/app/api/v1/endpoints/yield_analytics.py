from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta
import random
import json
import traceback
from app.core.database import get_db
from app.models.yield_analytics import YieldData
from app.models.wafer import Wafer, WaferBatch
from app.models.equipment import Equipment
from app.schemas.yield_analytics import YieldDataCreate, YieldResponse

router = APIRouter()

@router.post("/", response_model=YieldResponse)
def record_yield_data(yield_data: YieldDataCreate, db: Session = Depends(get_db)):
    try:
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
    except Exception as e:
        print(f"Error in record_yield_data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/trends")
def get_yield_trends(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        yield_data = db.query(YieldData).filter(
            YieldData.inspection_date >= cutoff_date
        ).all()
        
        if not yield_data:
            return {
                "message": "No yield data available",
                "trend": "insufficient_data",
                "period_days": days,
                "total_records": 0,
                "trend_analysis": {
                    "trend_direction": "No data",
                    "improvement_rate": 0,
                    "consistency_score": 0,
                    "projected_yield": 0
                }
            }
        
        total_yield = sum(d.yield_percentage for d in yield_data) / len(yield_data)
        avg_defects = sum(d.defect_count for d in yield_data) / len(yield_data)
        avg_quality = sum(d.quality_score for d in yield_data) / len(yield_data)
        
        recent = yield_data[-10:] if len(yield_data) > 10 else yield_data
        older = yield_data[:10] if len(yield_data) > 10 else yield_data
        recent_avg = sum(d.yield_percentage for d in recent) / len(recent) if recent else 0
        older_avg = sum(d.yield_percentage for d in older) / len(older) if older else 0
        
        if recent_avg > older_avg:
            trend_direction = "improving"
            improvement_rate = round(((recent_avg - older_avg) / older_avg) * 100, 2) if older_avg > 0 else 0
        elif recent_avg < older_avg:
            trend_direction = "declining"
            improvement_rate = round(((older_avg - recent_avg) / older_avg) * 100, 2) if older_avg > 0 else 0
        else:
            trend_direction = "stable"
            improvement_rate = 0
        
        std_dev = 0
        if len(yield_data) > 1:
            mean = total_yield
            variance = sum((d.yield_percentage - mean) ** 2 for d in yield_data) / len(yield_data)
            std_dev = variance ** 0.5
        consistency_score = max(0, 100 - (std_dev * 10))
        
        projected_yield = min(100, total_yield + (improvement_rate * 0.5))
        
        stage_defects = {}
        for data in yield_data:
            if data.process_stage not in stage_defects:
                stage_defects[data.process_stage] = {'defects': 0, 'count': 0}
            stage_defects[data.process_stage]['defects'] += data.defect_count
            stage_defects[data.process_stage]['count'] += 1
        
        stage_analysis = {}
        for stage, values in stage_defects.items():
            stage_analysis[stage] = round(values['defects'] / values['count'], 2) if values['count'] > 0 else 0
        
        return {
            "period_days": days,
            "total_records": len(yield_data),
            "average_yield": round(total_yield, 2),
            "average_defects": round(avg_defects, 2),
            "average_quality": round(avg_quality, 2),
            "defect_rate_by_stage": stage_analysis,
            "trend": trend_direction,
            "trend_analysis": {
                "trend_direction": trend_direction,
                "improvement_rate": improvement_rate,
                "consistency_score": round(consistency_score, 2),
                "projected_yield": round(projected_yield, 2),
                "recent_average": round(recent_avg, 2),
                "previous_average": round(older_avg, 2)
            }
        }
    except Exception as e:
        print(f"Error in get_yield_trends: {e}")
        traceback.print_exc()
        return {
            "error": str(e),
            "message": "Error fetching yield trends"
        }

@router.get("/quality/report")
def get_quality_report(db: Session = Depends(get_db)):
    try:
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
        
        if recent_yield:
            overall_yield = round(sum(d.yield_percentage for d in recent_yield) / len(recent_yield), 2)
            quality_score = round(sum(d.quality_score for d in recent_yield) / len(recent_yield), 2)
            avg_defects = round(sum(d.defect_count for d in recent_yield) / len(recent_yield), 2)
        else:
            overall_yield = 0
            quality_score = 0
            avg_defects = 0
        
        production_efficiency = round((overall_yield / 100) * 100, 2) if overall_yield > 0 else 0
        
        yields = [d.yield_percentage for d in recent_yield]
        if yields:
            variation = round(max(yields) - min(yields), 2)
            std_dev = round((sum((y - (sum(yields)/len(yields))) ** 2 for y in yields) / len(yields)) ** 0.5, 2)
            process_capability = round((100 - variation) / 100, 2) if variation > 0 else 0
        else:
            variation = 0
            std_dev = 0
            process_capability = 0
        
        insights = []
        if overall_yield > 90:
            insights.append("✅ Excellent overall yield. Manufacturing process is performing well.")
        elif overall_yield > 80:
            insights.append("⚠️ Good yield but there is room for improvement. Review defect patterns.")
        else:
            insights.append("❌ Yield below target. Immediate process review recommended.")
        
        if avg_defects > 3:
            insights.append("⚠️ High defect rate detected. Focus on defect reduction strategies.")
        elif avg_defects < 1:
            insights.append("✅ Low defect rate. Quality controls are effective.")
        
        if variation > 10:
            insights.append("⚠️ High process variation detected. Standardize process parameters.")
        elif variation < 5:
            insights.append("✅ Low process variation. Process is stable and controlled.")
        
        if len(recent_yield) == 0:
            insights.append("ℹ️ No yield data available. Start production to generate insights.")
        
        # Safe batch performance
        batch_performance = []
        for b in yield_by_batch:
            batch_performance.append({
                "batch_id": b.batch_id,
                "yield": round(b.avg_yield, 2) if b.avg_yield else 0,
                "quality": round(b.avg_quality, 2) if b.avg_quality else 0,
                "defects": b.total_defects or 0
            })
        
        # Safe stage analysis
        stage_analysis = {}
        for data in recent_yield:
            stage = data.process_stage
            if stage not in stage_analysis:
                stage_analysis[stage] = 0
        
        return {
            "total_wafers": total_wafers,
            "analyzed_wafers": len(recent_yield),
            "overall_yield": overall_yield,
            "quality_score": quality_score,
            "average_defects": avg_defects,
            "production_efficiency": production_efficiency,
            "process_variation": {
                "range": variation,
                "std_deviation": std_dev,
                "process_capability": process_capability,
                "status": "stable" if variation < 5 else "variable" if variation < 15 else "variable"
            },
            "batch_performance": batch_performance,
            "manufacturing_intelligence": {
                "insights": insights,
                "recommendations": [
                    "Review defect patterns at lithography stage" if stage_analysis.get('lithography', 0) > 2 else "Lithography stage is performing well",
                    "Optimize etching parameters" if stage_analysis.get('etching', 0) > 2 else "Etching stage is performing well",
                    "Inspect deposition process" if stage_analysis.get('deposition', 0) > 2 else "Deposition stage is performing well",
                    "Enhance inspection protocols" if stage_analysis.get('inspection', 0) > 2 else "Inspection stage is performing well"
                ],
                "summary": f"Overall manufacturing intelligence indicates a {'stable' if variation < 5 else 'variable'} operation with {'excellent' if overall_yield > 90 else 'good' if overall_yield > 80 else 'needs improvement'} yield."
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"Error in get_quality_report: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/process-variation")
def get_process_variation(db: Session = Depends(get_db)):
    try:
        yield_data = db.query(YieldData).order_by(
            YieldData.inspection_date.desc()
        ).limit(100).all()
        
        if not yield_data:
            return {
                "message": "No data available",
                "variation": 0,
                "status": "no_data",
                "overall_range": 0,
                "overall_avg": 0,
                "stage_variation": {},
                "total_samples": 0
            }
        
        yields = [d.yield_percentage for d in yield_data]
        stages = list(set(d.process_stage for d in yield_data))
        
        stage_variation = {}
        for stage in stages:
            stage_yields = [d.yield_percentage for d in yield_data if d.process_stage == stage]
            if stage_yields:
                stage_variation[stage] = {
                    "min": round(min(stage_yields), 2),
                    "max": round(max(stage_yields), 2),
                    "range": round(max(stage_yields) - min(stage_yields), 2),
                    "avg": round(sum(stage_yields) / len(stage_yields), 2)
                }
        
        overall_range = round(max(yields) - min(yields), 2) if yields else 0
        
        if overall_range < 5:
            status = "stable"
        elif overall_range < 15:
            status = "variable"
        else:
            status = "variable"
        
        return {
            "overall_range": overall_range,
            "overall_avg": round(sum(yields) / len(yields), 2) if yields else 0,
            "stage_variation": stage_variation,
            "status": status,
            "total_samples": len(yields)
        }
    except Exception as e:
        print(f"Error in get_process_variation: {e}")
        traceback.print_exc()
        return {
            "error": str(e),
            "message": "Error fetching process variation data",
            "stage_variation": {},
            "total_samples": 0,
            "status": "error"
        }
