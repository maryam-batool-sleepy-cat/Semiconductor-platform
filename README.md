# 🏭 Semiconductor Manufacturing Operations Platform

Enterprise platform for monitoring semiconductor fabrication processes, equipment health, wafer production, and predictive maintenance.

## 📋 Project Overview

This platform provides comprehensive monitoring and management of semiconductor fabrication operations with predictive maintenance capabilities.

### Features
- Predictive Maintenance - Equipment failure predictions
- Wafer Production Management - Track batches, stages, and completion
- Equipment Health Monitoring - Real-time equipment status and metrics
- Yield Analytics - Defect analysis and process variation
- Executive Dashboard - KPIs and operational reports
- User Authentication - Login for employees and admins

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11+
- Node.js 18+

### Docker Compose
Clone the repository:
git clone https://github.com/maryam-batool-sleepy-cat/Semiconductor-platform.git
cd Semiconductor-platform

Start all services:
sudo docker-compose up -d

Start the data simulator:
source backend/venv/bin/activate
pip install -r backend/requirements.txt
python3 data-simulator/simulate.py

start frontend
cd frontend
npm run dev

Access the platform:
Frontend: http://localhost:5173
API: http://localhost:8000
API Docs: http://localhost:8000/docs

## 🔑 Login Credentials

Employee Login: employee / employee123
Admin Login: admin / admin123

## 🧠 Predictive Maintenance

The platform predicts equipment failures based on:
- Operating hours
- Temperature
- Vibration
- Maintenance history

### How It Works
1. Equipment data is collected from the simulator
2. ML model analyzes patterns and predicts failure probability
3. Health score (0-100%) is calculated
4. Priority levels (Urgent/High/Medium/Low) are assigned
5. Recommended actions are generated

## 📊 Monitoring

- Prometheus: Collects API metrics
- Grafana: Pre-built dashboards for API and equipment metrics

## 🛠️ Technology Stack

Backend: FastAPI, Python
Frontend: React, TypeScript, Vite
Database: PostgreSQL, Redis
Monitoring: Prometheus, Grafana
Container: Docker, Kubernetes
CI/CD: GitHub Actions

## 📁 Project Structure

semiconductor-platform/
backend/
  app/
    api/          API endpoints
    core/         Database, security
    models/       Database models
    services/     ML, predictive maintenance
frontend/
  src/
    components/   React components
    services/     API services
k8s/              Kubernetes manifests
monitoring/       Prometheus/Grafana
docs/             Documentation

## 📚 Documentation

Installation Guide: docs/INSTALLATION.md
Deployment Guide: docs/DEPLOYMENT.md
User Guide: docs/USER_GUIDE.md
Admin Guide: docs/ADMIN_GUIDE.md
ML Guide: docs/ML_GUIDE.md
Kubernetes Guide: docs/KUBERNETES_GUIDE.md
Troubleshooting: docs/TROUBLESHOOTING.md

## 🧪 Testing

Run all tests:
cd backend
python -m pytest tests/test_all.py -v

Expected: 16 passed

## 📄 License

This project is for educational purposes.

---
