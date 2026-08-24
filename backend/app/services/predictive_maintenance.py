from datetime import datetime, timedelta
import logging
from app.models.equipment import Equipment, EquipmentStatus
from app.models.maintenance import Maintenance
from app.services.ml_model import predictor

logger = logging.getLogger(__name__)

class PredictiveMaintenanceService:
    def __init__(self):
        self.health_threshold = 70
        self.critical_threshold = 50
    
    def analyze_equipment_health(self, equipment):
        """Analyze health metrics and predict failure using ML"""
        try:
            # Get ML prediction
            failure_probability = predictor.predict_failure(equipment)
        except Exception as e:
            logger.warning(f"ML prediction failed: {e}")
            failure_probability = 0.5
        
        # Calculate health score
        health_score = 100 - (failure_probability * 100)
        
        # Determine status based on health score
        if health_score < 50:
            status = "critical"
            action = "Immediate maintenance required"
            priority = "urgent"
            days_until = 0
        elif health_score < 70:
            status = "warning"
            action = "Schedule maintenance within 7 days"
            priority = "high"
            days_until = 7
        else:
            status = "healthy"
            action = "Monitor regularly"
            priority = "low"
            days_until = 30
        
        return {
            "equipment_id": equipment.equipment_id,
            "name": equipment.name,
            "health_score": round(health_score, 2),
            "failure_probability": round(failure_probability * 100, 2),
            "status": status,
            "recommended_action": action,
            "priority": priority,
            "days_until_maintenance": days_until,
            "operating_hours": equipment.operating_hours or 0,
            "temperature": equipment.temperature or 0,
            "vibration": equipment.vibration or 0
        }
    
    def generate_maintenance_schedule(self, equipment_list):
        """Generate maintenance schedule based on predictions"""
        schedule = []
        for eq in equipment_list:
            try:
                analysis = self.analyze_equipment_health(eq)
                if analysis['priority'] in ['urgent', 'high']:
                    schedule.append(analysis)
            except Exception as e:
                logger.error(f"Error analyzing equipment {eq.equipment_id}: {e}")
                continue
        return sorted(schedule, key=lambda x: x['health_score'])
    
    def get_maintenance_kpis(self, equipment_list, maintenance_records):
        """Generate maintenance KPIs"""
        total = len(equipment_list)
        healthy = sum(1 for eq in equipment_list if eq.status == EquipmentStatus.OPERATIONAL)
        critical = sum(1 for eq in equipment_list if eq.status == EquipmentStatus.MAINTENANCE)
        
        scheduled = sum(1 for m in maintenance_records if m.status == "scheduled")
        completed = sum(1 for m in maintenance_records if m.status == "completed")
        
        return {
            "total_equipment": total,
            "healthy_count": healthy,
            "critical_count": critical,
            "scheduled_maintenance": scheduled,
            "completed_maintenance": completed,
            "health_rate": round((healthy / total) * 100, 2) if total > 0 else 0
        }

maintenance_service = PredictiveMaintenanceService()
