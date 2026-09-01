from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.models.wafer import Wafer, WaferBatch, WaferStatus
from app.schemas.wafer import WaferCreate, WaferResponse, BatchCreate, BatchResponse
from app.core.security import verify_token

router = APIRouter()

class StageUpdate(BaseModel):
    stage: str

@router.post("/batches", response_model=BatchResponse, dependencies=[Depends(verify_token)])
def create_batch(batch: BatchCreate, db: Session = Depends(get_db)):
    db_batch = WaferBatch(
        batch_name=batch.batch_name,
        product_type=batch.product_type,
        total_wafers=batch.total_wafers
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    
    for i in range(batch.total_wafers):
        wafer = Wafer(
            wafer_id=f"{batch.batch_name}-{i+1:03d}",
            batch_id=db_batch.id,
            position=i+1
        )
        db.add(wafer)
    
    db.commit()
    return db_batch

@router.get("/batches", dependencies=[Depends(verify_token)])
def get_batches(db: Session = Depends(get_db)):
    batches = db.query(WaferBatch).all()
    return {
        "batches": batches,
        "total": len(batches)
    }

@router.get("/wafers/{wafer_id}", response_model=WaferResponse, dependencies=[Depends(verify_token)])
def get_wafer(wafer_id: str, db: Session = Depends(get_db)):
    wafer = db.query(Wafer).filter(Wafer.wafer_id == wafer_id).first()
    if not wafer:
        raise HTTPException(status_code=404, detail="Wafer not found")
    return wafer

@router.patch("/wafers/{wafer_id}/stage", dependencies=[Depends(verify_token)])
def update_wafer_stage(
    wafer_id: str,
    stage_update: StageUpdate,
    db: Session = Depends(get_db)
):
    wafer = db.query(Wafer).filter(Wafer.wafer_id == wafer_id).first()
    if not wafer:
        raise HTTPException(status_code=404, detail="Wafer not found")
    
    try:
        new_stage = WaferStatus(stage_update.stage)
        wafer.current_stage = new_stage
        wafer.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(wafer)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid stage: {stage_update.stage}")
    
    if new_stage == WaferStatus.COMPLETED:
        batch = db.query(WaferBatch).filter(WaferBatch.id == wafer.batch_id).first()
        completed_wafers = db.query(Wafer).filter(
            Wafer.batch_id == batch.id,
            Wafer.current_stage == WaferStatus.COMPLETED
        ).count()
        if completed_wafers == batch.total_wafers:
            batch.status = WaferStatus.COMPLETED
            db.commit()
    
    return {"message": f"Wafer {wafer_id} updated to {new_stage.value}", "wafer": wafer}

@router.get("/batches/{batch_id}/history", dependencies=[Depends(verify_token)])
def get_batch_history(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(WaferBatch).filter(WaferBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    wafers = db.query(Wafer).filter(Wafer.batch_id == batch_id).all()
    return {
        "batch": batch,
        "wafers": wafers,
        "total_wafers": len(wafers),
        "completed": sum(1 for w in wafers if w.current_stage == WaferStatus.COMPLETED)
    }

@router.post("/auto-advance/{batch_id}", dependencies=[Depends(verify_token)])
def auto_advance_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(WaferBatch).filter(WaferBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if batch.status == WaferStatus.COMPLETED:
        return {"message": "Batch already completed", "wafers": []}
    
    stage_order = [
        WaferStatus.REGISTERED,
        WaferStatus.LITHOGRAPHY,
        WaferStatus.ETCHING,
        WaferStatus.DEPOSITION,
        WaferStatus.INSPECTION,
        WaferStatus.COMPLETED
    ]
    
    updated_wafers = []
    
    for wafer in batch.wafers:
        if wafer.current_stage == WaferStatus.COMPLETED:
            continue
            
        current_idx = stage_order.index(wafer.current_stage)
        next_idx = min(current_idx + 1, len(stage_order) - 1)
        next_stage = stage_order[next_idx]
        
        wafer.current_stage = next_stage
        wafer.updated_at = datetime.utcnow()
        updated_wafers.append({
            "wafer_id": wafer.wafer_id,
            "old_stage": stage_order[current_idx].value,
            "new_stage": next_stage.value
        })
    
    db.commit()
    
    all_completed = all(w.current_stage == WaferStatus.COMPLETED for w in batch.wafers)
    if all_completed:
        batch.status = WaferStatus.COMPLETED
        db.commit()
    
    return {
        "message": f"Advanced {len(updated_wafers)} wafers to next stage",
        "wafers": updated_wafers,
        "batch_status": batch.status.value
    }

@router.post("/auto-complete/{batch_id}", dependencies=[Depends(verify_token)])
def auto_complete_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(WaferBatch).filter(WaferBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if batch.status == WaferStatus.COMPLETED:
        return {"message": "Batch already completed", "wafers": []}
    
    completed_wafers = []
    
    for wafer in batch.wafers:
        if wafer.current_stage != WaferStatus.COMPLETED:
            old_stage = wafer.current_stage.value
            wafer.current_stage = WaferStatus.COMPLETED
            wafer.updated_at = datetime.utcnow()
            completed_wafers.append({
                "wafer_id": wafer.wafer_id,
                "old_stage": old_stage,
                "new_stage": "completed"
            })
    
    batch.status = WaferStatus.COMPLETED
    db.commit()
    
    return {
        "message": f"Completed {len(completed_wafers)} wafers",
        "wafers": completed_wafers,
        "batch_status": "completed"
    }
