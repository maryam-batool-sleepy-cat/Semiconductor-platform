import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
import logging

logger = logging.getLogger(__name__)

class FailurePredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "/app/models/failure_predictor.pkl"
        
    def generate_training_data(self, equipment_list):
        """Generate synthetic training data based on equipment metrics"""
        data = []
        for eq in equipment_list:
            # Features: operating_hours, temperature, vibration, age_days
            features = {
                'operating_hours': eq.operating_hours or 0,
                'temperature': eq.temperature or 25,
                'vibration': eq.vibration or 0.5,
                'age_days': (eq.created_at - eq.installation_date).days if eq.installation_date else 30,
                'maintenance_count': len(eq.maintenance_records) if hasattr(eq, 'maintenance_records') else 0
            }
            # Label: 1 if operating_hours > 1200 or temperature > 80 or vibration > 5
            failed = 1 if (eq.operating_hours > 1200 or (eq.temperature or 0) > 80 or (eq.vibration or 0) > 5) else 0
            features['failed'] = failed
            data.append(features)
        
        return pd.DataFrame(data)
    
    def train(self, equipment_data):
        """Train ML model on equipment data"""
        if len(equipment_data) < 5:
            logger.warning("Not enough data to train model")
            return False
        
        df = pd.DataFrame(equipment_data)
        feature_cols = ['operating_hours', 'temperature', 'vibration', 'age_days', 'maintenance_count']
        
        X = df[feature_cols].fillna(0)
        y = df['failed']
        
        X_scaled = self.scaler.fit_transform(X)
        
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
        # Save model
        os.makedirs("/app/models", exist_ok=True)
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler
        }, self.model_path)
        
        logger.info("ML model trained successfully")
        return True
    
    def predict_failure(self, equipment):
        """Predict failure probability for a single equipment"""
        if not self.is_trained:
            logger.warning("Model not trained, using fallback rules")
            return self._fallback_prediction(equipment)
        
        features = np.array([[
            equipment.operating_hours or 0,
            equipment.temperature or 25,
            equipment.vibration or 0.5,
            30,  # default age
            0   # default maintenance count
        ]])
        
        scaled_features = self.scaler.transform(features)
        probability = self.model.predict_proba(scaled_features)[0][1]
        
        return round(probability * 100, 2)
    
    def _fallback_prediction(self, equipment):
        """Rule-based fallback when model isn't trained"""
        hours = equipment.operating_hours or 0
        temp = equipment.temperature or 25
        vib = equipment.vibration or 0.5
        
        score = 0
        if hours > 1200:
            score += 50
        elif hours > 800:
            score += 30
        elif hours > 500:
            score += 15
            
        if temp > 80:
            score += 30
        elif temp > 70:
            score += 15
            
        if vib > 5:
            score += 20
        elif vib > 3:
            score += 10
            
        return min(score, 99)

predictor = FailurePredictor()
