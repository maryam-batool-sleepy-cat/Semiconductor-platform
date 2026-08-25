# ML-Based Predictive Maintenance Guide

## Overview

The platform uses a Random Forest Classifier to predict equipment failures based on operational data. This guide explains how the ML model works and how to use it.

## Model Architecture

### Features Used
operating_hours - Total hours equipment has run
temperature - Current operating temperature in Celsius
vibration - Current vibration level in mm/s
age_days - Age of equipment in days
maintenance_count - Number of maintenance events

### Target Variable
failed - Binary label (1 = failure, 0 = normal operation)

### Training Data Generation

The model is trained on synthetic data generated from equipment metrics with threshold-based labeling:
- If operating_hours > 1200: failed = 1
- Else if temperature > 80: failed = 1
- Else if vibration > 5: failed = 1
- Else: failed = 0

## How to Use

### 1. View Predictions

Go to the Maintenance page in the frontend to see:
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

The model trains automatically when you view predictions. To manually trigger training via API:
curl http://localhost:8000/api/v1/maintenance/predictions

To trigger via Python:
python3 -c "
from app.services.ml_model import predictor
from app.core.database import SessionLocal
from app.models.equipment import Equipment
db = SessionLocal()
equipment = db.query(Equipment).all()
train_data = predictor.generate_training_data(equipment)
predictor.train(train_data)
"

## Health Score Calculation

The health score is derived from the failure probability:
health_score = 100 - (failure_probability * 100)

Health Score Ranges:
- 70-100: Healthy - Monitor regularly
- 50-70: Warning - Schedule maintenance within 7 days
- 0-50: Critical - Immediate maintenance required

## Priority Levels

Urgent: Health Score < 50, Immediate maintenance required
High: Health Score 50-70, Schedule within 7 days
Medium: Health Score 70-85, Schedule within 30 days
Low: Health Score > 85, Monitor regularly

## Model Performance

The model is evaluated using:
- Accuracy: Percentage of correct predictions
- Precision: Percentage of true failures correctly identified
- Recall: Percentage of actual failures detected

## Retraining

The model should be retrained when:
- New equipment is added
- Significant changes in performance occur
- At least 100 new data points are available

## Troubleshooting

### Model Not Training
Check if there is enough data (minimum 3 equipment records)
Verify the API is running
Check logs: docker-compose logs api

### Incorrect Predictions
Ensure equipment data is being collected
Check if features are within expected ranges
Consider retraining with more data

### Health Score Always 100
Model may not be trained (check logs)
Equipment may all be healthy
Check if operating_hours data is being recorded

## API Endpoints

GET /api/v1/maintenance/predictions - Get all predictions
GET /api/v1/maintenance/alerts - Get active alerts
POST /api/v1/maintenance/schedule - Schedule maintenance
POST /api/v1/maintenance/complete/{id} - Complete maintenance
GET /api/v1/maintenance/history - Get maintenance history
GET /api/v1/maintenance/executive-report - Get executive report

