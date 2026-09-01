import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import get_db, Base
from app.models import equipment, maintenance, wafer, yield_analytics

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up
    Base.metadata.drop_all(bind=engine)

def test_health_endpoint():
    """Test that health endpoint returns 200"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_maintenance_predictions_empty():
    """Test maintenance predictions with no data"""
    response = client.get("/api/v1/maintenance/predictions")
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert "total_predictions" in data

def test_equipment_list_empty():
    """Test equipment list with no data"""
    response = client.get("/api/v1/equipment/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_wafer_batches_empty():
    """Test wafer batches with no data"""
    response = client.get("/api/v1/wafers/batches")
    assert response.status_code == 200
    data = response.json()
    assert "batches" in data
    assert "total" in data

def test_yield_trends():
    """Test yield trends endpoint"""
    response = client.get("/api/v1/yield/analytics/trends?days=7")
    assert response.status_code == 200
    data = response.json()
    assert "trend" in data or "message" in data

def test_dashboard_overview():
    """Test dashboard overview endpoint"""
    response = client.get("/api/v1/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "wafer_metrics" in data
    assert "equipment_metrics" in data
    assert "quality_metrics" in data
    assert "maintenance_metrics" in data

def test_health_database():
    """Test health endpoint database check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["database"] == "healthy"

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
