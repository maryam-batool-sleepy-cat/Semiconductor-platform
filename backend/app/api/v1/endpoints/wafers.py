from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.wafer import Wafer, WaferBatch, WaferStatus
from app.schemas.wafer import WaferCreate, WaferResponse, BatchCreate, BatchResponse

router = APIRouter()

@router.post("/batches", response_model=BatchResponse)
def create_batch(batch: BatchCreate, db: Session = Depends(get_db)):
    """Register a new wafer batch"""
    db_batch = WaferBatch(
        batch_name=batch.batch_name,
        product_type=batch.product_type,
        total_wafers=batch.total_wafers
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    
    # Create individual wafers in the batch
    for i in range(batch.total_wafers):
        wafer = Wafer(
            wafer_id=f"{batch.batch_name}-{i+1:03d}",
            batch_id=db_batch.id,
            position=i+1
        )
        db.add(wafer)
    
    db.commit()
    return db_batch

@router.get("/batches")
def get_batches(db: Session = Depends(get_db)):
    """Get all wafer batches"""
    batches = db.query(WaferBatch).all()
    return {
        "batches": batches,
        "total": len(batches)
    }

@router.get("/wafers/{wafer_id}", response_model=WaferResponse)
def get_wafer(wafer_id: str, db: Session = Depends(get_db)):
    """Get wafer by ID with full lifecycle history"""
    wafer = db.query(Wafer).filter(Wafer.wafer_id == wafer_id).first()
    if not wafer:
        raise HTTPException(status_code=404, detail="Wafer not found")
    return wafer

@router.patch("/wafers/{wafer_id}/stage")
def update_wafer_stage(
    wafer_id: str,
    stage: WaferStatus,
    db: Session = Depends(get_db)
):
    """Update wafer production stage"""
    wafer = db.query(Wafer).filter(Wafer.wafer_id == wafer_id).first()
    if not wafer:
        raise HTTPException(status_code=404, detail="Wafer not found")
    
    wafer.current_stage = stage
    wafer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(wafer)
    
    # Update batch status if all wafers completed
    if stage == WaferStatus.COMPLETED:
        batch = db.query(WaferBatch).filter(WaferBatch.id == wafer.batch_id).first()
        completed_wafers = db.query(Wafer).filter(
            Wafer.batch_id == batch.id,
            Wafer.current_stage == WaferStatus.COMPLETED
        ).count()
        if completed_wafers == batch.total_wafers:
            batch.status = WaferStatus.COMPLETED
            db.commit()
    
    return {"message": f"Wafer {wafer_id} updated to {stage.value}", "wafer": wafer}

@router.get("/batches/{batch_id}/history")
def get_batch_history(batch_id: int, db: Session = Depends(get_db)):
    """Get complete production history for a batch"""
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
