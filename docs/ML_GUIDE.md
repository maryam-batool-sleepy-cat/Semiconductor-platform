# ML-Based Predictive Maintenance Guide

## Overview

The platform uses a Random Forest Classifier to predict equipment failures based on operational data.

## Model Architecture

### Features Used
- operating_hours: Total hours equipment has run
- temperature: Current operating temperature (C)
- vibration: Current vibration level (mm/s)
- age_days: Age of equipment in days (calculated from installation_date)
- maintenance_count: Number of maintenance events

### Target Variable
- failed: Binary label (1 = failure, 0 = normal operation)

### Training Data Generation

The model is trained on synthetic data generated from equipment metrics:
if operating_hours > 1200: failed = 1
elif temperature > 80: failed = 1
elif vibration > 5: failed = 1
else: failed = 0

## How to Use

### 1. View Predictions
Go to the Maintenance page to see:
- Health Score (0-100%) - Higher is better
- Failure Probability (0-100%) - Higher is worse
- Priority Level - Urgent/High/Medium/Low
- Recommended Action - What to do next

### 2. Prediction Details
Click View Details on any prediction to see:
- Operating hours
- Temperature
- Vibration
- Health score breakdown
- Days until recommended maintenance

### 3. Training the Model
The model trains automatically when you view predictions. To manually trigger training:
curl http://localhost:8000/api/v1/maintenance/predictions

### 4. Python Training
from app.services.ml_model import predictor
from app.core.database import SessionLocal
from app.models.equipment import Equipment

db = SessionLocal()
equipment = db.query(Equipment).all()
train_data = predictor.generate_training_data(equipment)
predictor.train(train_data)

## Health Score Calculation

The health score is derived from the failure probability:
health_score = 100 - (failure_probability * 100)

### Health Score Ranges
- 70-100: Healthy - Monitor regularly
- 50-70: Warning - Schedule within 7 days
- 0-50: Critical - Immediate maintenance

## Priority Levels
- Urgent: Health Score < 50, Immediate maintenance
- High: Health Score 50-70, Schedule within 7 days
- Medium: Health Score 70-85, Schedule within 30 days
- Low: Health Score > 85, Monitor regularly

## Model Performance

The model is evaluated using:
- Accuracy: Percentage of correct predictions
- Precision: True failures correctly identified
- Recall: Actual failures detected

## Retraining

The model should be retrained when:
- New equipment is added
- Significant changes in performance occur
- At least 100 new data points are available

## Troubleshooting

### Model Not Training
- Check if there is enough data (minimum 3 equipment records)
- Verify the API is running
- Check logs: sudo docker-compose logs api

### Incorrect Predictions
- Ensure equipment data is being collected
- Check if features are within expected ranges
- Consider retraining with more data

## API Endpoints

- GET /api/v1/maintenance/predictions - Get all predictions
- GET /api/v1/maintenance/alerts - Get active alerts
- POST /api/v1/maintenance/schedule - Schedule maintenance
- POST /api/v1/maintenance/complete/{id} - Complete maintenance

---
