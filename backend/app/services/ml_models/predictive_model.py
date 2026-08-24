"""
Machine Learning Model for Predictive Maintenance
Uses Scikit-learn to predict equipment failures
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import logging
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)

class PredictiveMaintenanceModel:
    """ML model for predicting equipment failures"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "/app/models/failure_predictor.pkl"
        self.scaler_path = "/app/models/scaler.pkl"
        
    def generate_training_data(self, num_samples=1000):
        """Generate synthetic training data"""
        np.random.seed(42)
        
        # Features: operating_hours, temperature, vibration, age_days
        operating_hours = np.random.uniform(0, 2000, num_samples)
        temperature = np.random.uniform(20, 90, num_samples)
        vibration = np.random.uniform(0.1, 10, num_samples)
        age_days = np.random.uniform(0, 365, num_samples)
        
        # Failure logic: higher hours + temp + vibration = more likely to fail
        failure_prob = (
            (operating_hours / 2000) * 0.4 +
            (temperature / 90) * 0.3 +
            (vibration / 10) * 0.2 +
            (age_days / 365) * 0.1
        )
        
        # Add some randomness
        failure_prob = failure_prob + np.random.normal(0, 0.1, num_samples)
        failure_prob = np.clip(failure_prob, 0, 1)
        
        # Label: 1 if failure_prob > 0.6, else 0
        failed = (failure_prob > 0.6).astype(int)
        
        X = pd.DataFrame({
            'operating_hours': operating_hours,
            'temperature': temperature,
            'vibration': vibration,
            'age_days': age_days
        })
        y = pd.Series(failed)
        
        return X, y
    
    def train(self, X=None, y=None):
        """Train the Random Forest model"""
        if X is None or y is None:
            logger.info("Generating training data...")
            X, y = self.generate_training_data(2000)
        
        logger.info(f"Training data shape: {X.shape}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Model accuracy: {accuracy:.2%}")
        logger.info(f"Classification Report:\n{classification_report(y_test, y_pred)}")
        
        self.is_trained = True
        return accuracy
    
    def predict_failure_probability(self, equipment_data):
        """
        Predict failure probability for a single equipment
        
        Args:
            equipment_data: dict with 'operating_hours', 'temperature', 'vibration'
        
        Returns:
            float: Probability of failure (0-1)
        """
        if not self.is_trained:
            self.load_model()
            if not self.is_trained:
                self.train()
        
        features = np.array([[
            equipment_data.get('operating_hours', 0),
            equipment_data.get('temperature', 25),
            equipment_data.get('vibration', 1),
            equipment_data.get('age_days', 0)
        ]])
        
        scaled_features = self.scaler.transform(features)
        probability = self.model.predict_proba(scaled_features)[0][1]
        return probability
    
    def predict_failure_batch(self, equipment_list):
        """Predict failure probability for multiple equipment"""
        results = []
        for eq in equipment_list:
            prob = self.predict_failure_probability(eq)
            results.append({
                'equipment_id': eq.get('equipment_id'),
                'failure_probability': round(prob, 3),
                'status': 'critical' if prob > 0.7 else 'warning' if prob > 0.4 else 'healthy'
            })
        return results
    
    def save_model(self):
        """Save the trained model"""
        if not self.is_trained:
            logger.warning("Model not trained, cannot save")
            return False
        
        os.makedirs("/app/models", exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        logger.info(f"Model saved to {self.model_path}")
        return True
    
    def load_model(self):
        """Load a saved model"""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.is_trained = True
            logger.info("Model loaded successfully")
            return True
        logger.warning("Model files not found")
        return False

# Global instance
predictive_model = PredictiveMaintenanceModel()
