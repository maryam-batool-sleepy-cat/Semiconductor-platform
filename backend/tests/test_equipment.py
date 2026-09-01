import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_equipment_health_report():
    """Test equipment health report endpoint"""
    response = client.get("/api/v1/equipment/report")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "metrics" in data

def test_equipment_metrics():
    """Test equipment metrics endpoint with valid ID"""
    # First get equipment list
    response = client.get("/api/v1/equipment/")
    if response.status_code == 200 and len(response.json()) > 0:
        eq_id = response.json()[0]["equipment_id"]
        metrics_response = client.get(f"/api/v1/equipment/metrics/{eq_id}")
        assert metrics_response.status_code == 200
        data = metrics_response.json()
        assert "equipment_id" in data or "detail" in data
