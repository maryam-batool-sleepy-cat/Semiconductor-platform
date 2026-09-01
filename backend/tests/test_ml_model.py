import pytest
from app.services.ml_model import predictor
from app.services.predictive_maintenance import maintenance_service

class MockEquipment:
    def __init__(self, operating_hours=0, temperature=25, vibration=0.5):
        self.operating_hours = operating_hours
        self.temperature = temperature
        self.vibration = vibration
        self.installation_date = None
        self.created_at = None
        self.equipment_id = "TEST-001"
        self.name = "Test Equipment"

def test_fallback_prediction():
    """Test fallback prediction when model not trained"""
    eq = MockEquipment(operating_hours=500)
    probability = predictor._fallback_prediction(eq)
    assert 0 <= probability <= 1

def test_fallback_prediction_high_hours():
    """Test fallback prediction with high operating hours"""
    eq = MockEquipment(operating_hours=1300)
    probability = predictor._fallback_prediction(eq)
    assert probability > 0.5

def test_fallback_prediction_low_hours():
    """Test fallback prediction with low operating hours"""
    eq = MockEquipment(operating_hours=100)
    probability = predictor._fallback_prediction(eq)
    assert probability < 0.3

def test_equipment_health_analysis():
    """Test equipment health analysis"""
    eq = MockEquipment(operating_hours=1000, temperature=75, vibration=4.0)
    analysis = maintenance_service.analyze_equipment_health(eq)
    assert "health_score" in analysis
    assert "failure_probability" in analysis
    assert "priority" in analysis
    assert "recommended_action" in analysis
    assert 0 <= analysis["health_score"] <= 100
