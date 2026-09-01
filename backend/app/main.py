from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from prometheus_fastapi_instrumentator import Instrumentator
import logging
from datetime import datetime
from app.core.database import get_db, engine
from app.models import wafer, equipment, maintenance, yield_analytics, isa95
from app.api.v1.endpoints import (
    wafers, equipment as equipment_endpoints,
    maintenance as maintenance_endpoints, yield_analytics as yield_endpoints,
    dashboard, isa95 as isa95_endpoints, auth
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Creating database tables...")
wafer.Base.metadata.create_all(bind=engine)
equipment.Base.metadata.create_all(bind=engine)
maintenance.Base.metadata.create_all(bind=engine)
yield_analytics.Base.metadata.create_all(bind=engine)
isa95.Base.metadata.create_all(bind=engine)
logger.info("Database tables created successfully")

app = FastAPI(
    title="Semiconductor Manufacturing Platform API",
    description="Enterprise Semiconductor Manufacturing Operations Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Include routers - Auth router is public
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])

# Protected routers (require JWT)
app.include_router(wafers.router, prefix="/api/v1/wafers", tags=["Wafers"])
app.include_router(equipment_endpoints.router, prefix="/api/v1/equipment", tags=["Equipment"])
app.include_router(maintenance_endpoints.router, prefix="/api/v1/maintenance", tags=["Maintenance"])
app.include_router(yield_endpoints.router, prefix="/api/v1/yield", tags=["Yield Analytics"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(isa95_endpoints.router, prefix="/api/v1/isa95", tags=["ISA-95 Metrics"])

@app.get("/")
async def root():
    return {
        "message": "Semiconductor Manufacturing Platform API",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
