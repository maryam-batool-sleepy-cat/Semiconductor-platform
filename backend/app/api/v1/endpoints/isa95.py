from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Optional
from app.core.database import get_db
from app.models.equipment import Equipment, EquipmentStatus
from app.models.isa95 import EquipmentSchedule, GoalTracker, DailyTask, InventoryItem, DefectReport
from app.models.wafer import Wafer
from pydantic import BaseModel

router = APIRouter()

class ScheduleCreate(BaseModel):
    equipment_id: int
    scheduled_start: datetime
    scheduled_end: datetime
    schedule_type: str
    is_scheduled_downtime: bool = False
    is_unscheduled_downtime: bool = False

class GoalTrackerCreate(BaseModel):
    goal_name: str
    description: str
    target_value: float
    unit: str
    deadline: datetime

class DailyTaskCreate(BaseModel):
    task_name: str
    description: str
    assigned_to: str
    priority: str = "medium"
    due_date: datetime
    batch_id: Optional[int] = None
    equipment_id: Optional[int] = None

class InventoryItemCreate(BaseModel):
    item_id: str
    name: str
    category: str
    quantity: int = 0
    min_threshold: int = 10
    max_threshold: int = 100
    location: str
    supplier: str

class DefectReportCreate(BaseModel):
    wafer_id: int
    defect_type: str
    severity: str
    description: str
    found_at_stage: str
    reported_by: str

@router.get("/equipment-metrics/{equipment_id}")
def get_equipment_metrics(equipment_id: str, db: Session = Depends(get_db)):
    equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    total_time = equipment.total_time_hours or 1
    uptime_percentage = (equipment.uptime_hours / total_time) * 100 if total_time > 0 else 0
    downtime_percentage = (equipment.downtime_hours / total_time) * 100 if total_time > 0 else 0
    
    return {
        "equipment_id": equipment_id,
        "name": equipment.name,
        "status": equipment.status.value,
        "operating_hours": equipment.operating_hours,
        "total_time_hours": total_time,
        "uptime_hours": equipment.uptime_hours,
        "downtime_hours": equipment.downtime_hours,
        "scheduled_downtime_hours": equipment.scheduled_downtime_hours,
        "unscheduled_downtime_hours": equipment.unscheduled_downtime_hours,
        "productive_time_hours": equipment.productive_time_hours,
        "standby_time_hours": equipment.standby_time_hours,
        "engineering_time_hours": equipment.engineering_time_hours,
        "uptime_percentage": round(uptime_percentage, 2),
        "downtime_percentage": round(downtime_percentage, 2),
        "availability": round((equipment.uptime_hours / total_time) * 100 if total_time > 0 else 0, 2),
    }

@router.post("/equipment-schedule")
def create_equipment_schedule(schedule: ScheduleCreate, db: Session = Depends(get_db)):
    equipment = db.query(Equipment).filter(Equipment.id == schedule.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    db_schedule = EquipmentSchedule(
        equipment_id=schedule.equipment_id,
        scheduled_start=schedule.scheduled_start,
        scheduled_end=schedule.scheduled_end,
        schedule_type=schedule.schedule_type,
        is_scheduled_downtime=schedule.is_scheduled_downtime,
        is_unscheduled_downtime=schedule.is_unscheduled_downtime
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.get("/goal-tracker")
def get_goals(db: Session = Depends(get_db)):
    goals = db.query(GoalTracker).all()
    return {
        "goals": goals,
        "total": len(goals),
        "achieved": sum(1 for g in goals if g.status == "achieved"),
        "active": sum(1 for g in goals if g.status == "active"),
    }

@router.post("/goal-tracker")
def create_goal(goal: GoalTrackerCreate, db: Session = Depends(get_db)):
    db_goal = GoalTracker(
        goal_name=goal.goal_name,
        description=goal.description,
        target_value=goal.target_value,
        unit=goal.unit,
        deadline=goal.deadline
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/daily-tasks")
def get_daily_tasks(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DailyTask)
    if status:
        query = query.filter(DailyTask.status == status)
    return query.all()

@router.post("/daily-tasks")
def create_task(task: DailyTaskCreate, db: Session = Depends(get_db)):
    db_task = DailyTask(
        task_name=task.task_name,
        description=task.description,
        assigned_to=task.assigned_to,
        priority=task.priority,
        due_date=task.due_date,
        batch_id=task.batch_id,
        equipment_id=task.equipment_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/inventory")
def get_inventory(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InventoryItem)
    if category:
        query = query.filter(InventoryItem.category == category)
    if search:
        query = query.filter(
            (InventoryItem.name.ilike(f"%{search}%")) |
            (InventoryItem.item_id.ilike(f"%{search}%"))
        )
    return query.all()

@router.post("/inventory")
def create_inventory_item(item: InventoryItemCreate, db: Session = Depends(get_db)):
    db_item = InventoryItem(
        item_id=item.item_id,
        name=item.name,
        category=item.category,
        quantity=item.quantity,
        min_threshold=item.min_threshold,
        max_threshold=item.max_threshold,
        location=item.location,
        supplier=item.supplier
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.post("/defect-report")
def create_defect_report(report: DefectReportCreate, db: Session = Depends(get_db)):
    wafer = db.query(Wafer).filter(Wafer.id == report.wafer_id).first()
    if not wafer:
        raise HTTPException(status_code=404, detail="Wafer not found")
    
    db_report = DefectReport(
        wafer_id=report.wafer_id,
        defect_type=report.defect_type,
        severity=report.severity,
        description=report.description,
        found_at_stage=report.found_at_stage,
        reported_by=report.reported_by
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report
