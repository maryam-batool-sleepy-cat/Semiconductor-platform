import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class FailurePredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "/app/models/failure_predictor.pkl"
        self.feature_names = ['operating_hours', 'temperature', 'vibration', 'age_days', 'maintenance_count']
        
    def generate_training_data(self, equipment_list):
        """Generate synthetic training data based on equipment metrics"""
        data = []
        for eq in equipment_list:
            # Calculate age in days from installation_date if available
            age_days = 30  # Default fallback
            if eq.installation_date:
                age_days = (datetime.utcnow() - eq.installation_date).days
            elif eq.created_at:
                age_days = (datetime.utcnow() - eq.created_at).days
            
            # Get maintenance count from records if available
            maint_count = 0
            if hasattr(eq, 'maintenance_records') and eq.maintenance_records:
                maint_count = len(eq.maintenance_records)
            
            features = {
                'operating_hours': eq.operating_hours or 0,
                'temperature': eq.temperature or 25,
                'vibration': eq.vibration or 0.5,
                'age_days': age_days,
                'maintenance_count': maint_count,
                'failed': 1 if (eq.operating_hours > 1200 or (eq.temperature or 0) > 80 or (eq.vibration or 0) > 5) else 0
            }
            data.append(features)
        
        return pd.DataFrame(data)
    
    def train(self, equipment_data):
        """Train ML model on equipment data"""
        if len(equipment_data) < 3:
            logger.warning("Not enough data to train model, using fallback")
            self.is_trained = False
            return False
        
        df = pd.DataFrame(equipment_data)
        feature_cols = ['operating_hours', 'temperature', 'vibration', 'age_days', 'maintenance_count']
        
        X = df[feature_cols].fillna(0)
        y = df['failed']
        
        # Check if we have both classes
        if len(set(y)) < 2:
            logger.warning("Only one class present in training data, using fallback")
            self.is_trained = False
            return False
        
        X_scaled = self.scaler.fit_transform(X)
        
        self.model = RandomForestClassifier(
            n_estimators=50,
            max_depth=5,
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
        
        logger.info(f"ML model trained successfully on {len(df)} samples")
        return True
    
    def predict_failure(self, equipment):
        """Predict failure probability for a single equipment using ALL features"""
        if not self.is_trained or self.model is None:
            logger.debug("Model not trained, using fallback prediction")
            return self._fallback_prediction(equipment)
        
        try:
            # Calculate age_days from actual data
            age_days = 30  # Default
            if equipment.installation_date:
                age_days = (datetime.utcnow() - equipment.installation_date).days
            elif equipment.created_at:
                age_days = (datetime.utcnow() - equipment.created_at).days
            
            # Get maintenance count
            maint_count = 0
            if hasattr(equipment, 'maintenance_records') and equipment.maintenance_records:
                maint_count = len(equipment.maintenance_records)
            
            features = np.array([[
                equipment.operating_hours or 0,
                equipment.temperature or 25,
                equipment.vibration or 0.5,
                age_days,
                maint_count
            ]])
            
            scaled_features = self.scaler.transform(features)
            probabilities = self.model.predict_proba(scaled_features)
            
            if probabilities.shape[1] == 1:
                return float(probabilities[0][0])
            
            return float(probabilities[0][1])
        except Exception as e:
            logger.warning(f"ML prediction failed: {e}, using fallback")
            return self._fallback_prediction(equipment)
    
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
            
        return min(score, 99) / 100

predictor = FailurePredictor()
