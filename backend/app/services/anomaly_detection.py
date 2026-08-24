"""
Anomaly Detection for Semiconductor Manufacturing
Uses statistical methods to detect anomalies in production data
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from scipy import stats
import logging

logger = logging.getLogger(__name__)

class AnomalyDetector:
    """Detect anomalies in manufacturing data"""
    
    def __init__(self):
        self.threshold = 3.0  # Standard deviations for anomaly detection
    
    def detect_yield_anomaly(self, yield_data):
        """
        Detect anomalies in yield data
        Uses Z-score method
        """
        if len(yield_data) < 10:
            return {"anomaly": False, "reason": "Insufficient data"}
        
        yields = [d.yield_percentage for d in yield_data]
        mean = np.mean(yields)
        std = np.std(yields)
        
        # Calculate Z-scores
        z_scores = [(y - mean) / std if std > 0 else 0 for y in yields]
        
        anomalies = []
        for i, z in enumerate(z_scores):
            if abs(z) > self.threshold:
                anomalies.append({
                    'index': i,
                    'yield': yields[i],
                    'z_score': z,
                    'severity': 'high' if abs(z) > 4 else 'medium'
                })
        
        return {
            'anomalies': anomalies,
            'count': len(anomalies),
            'mean': round(mean, 2),
            'std': round(std, 2),
            'is_anomalous': len(anomalies) > 0
        }
    
    def detect_equipment_anomaly(self, equipment_history):
        """
        Detect anomalies in equipment telemetry
        Uses IQR method
        """
        if len(equipment_history) < 10:
            return {"anomaly": False, "reason": "Insufficient data"}
        
        temperatures = [h.get('temperature', 0) for h in equipment_history]
        vibrations = [h.get('vibration', 0) for h in equipment_history]
        power = [h.get('power_consumption', 0) for h in equipment_history]
        
        def detect_iqr(data, name):
            q1 = np.percentile(data, 25)
            q3 = np.percentile(data, 75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            anomalies = []
            for i, value in enumerate(data):
                if value < lower_bound or value > upper_bound:
                    anomalies.append({
                        'index': i,
                        'metric': name,
                        'value': value,
                        'lower_bound': lower_bound,
                        'upper_bound': upper_bound
                    })
            return anomalies
        
        all_anomalies = []
        all_anomalies.extend(detect_iqr(temperatures, 'temperature'))
        all_anomalies.extend(detect_iqr(vibrations, 'vibration'))
        all_anomalies.extend(detect_iqr(power, 'power'))
        
        return {
            'anomalies': all_anomalies,
            'count': len(all_anomalies),
            'is_anomalous': len(all_anomalies) > 0
        }

anomaly_detector = AnomalyDetector()
