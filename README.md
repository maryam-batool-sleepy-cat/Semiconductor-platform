# 🏭 Semiconductor Manufacturing Operations Platform

Enterprise platform for monitoring semiconductor fabrication processes, equipment health, wafer production, and predictive maintenance using Machine Learning.

## 📋 Project Overview

This platform provides comprehensive monitoring and management of semiconductor fabrication operations with AI-powered predictive maintenance.

### Key Features
- ML-Based Predictive Maintenance - Random Forest model predicts equipment failures
- Wafer Production Management - Track batches, stages, and completion
- Equipment Health Monitoring - Real-time equipment status and metrics
- Yield Analytics - Defect analysis and process variation
- Executive Dashboard - KPIs and operational reports
- Keycloak SSO - Enterprise-grade identity management
- Kubernetes Deployment - Production-ready container orchestration

## 🚀 Quick Start

### Prerequisites
Docker and Docker Compose
Python 3.11+
Node.js 18+
Minikube for Kubernetes

### Docker Compose (Recommended)
Clone the repository
git clone https://github.com/maryam-batool-cat/Semiconductor-platform.git
cd Semiconductor-platform

Start all services
sudo docker-compose up -d

Start the data simulator
source backend/venv/bin/activate
pip install -r backend/requirements.txt
python3 data-simulator/simulate.py

Access the platform
Frontend: http://localhost:5173
API: http://localhost:8000
API Docs: http://localhost:8000/docs
Grafana: http://localhost:3000 (admin/admin)
Keycloak Admin: http://localhost:8081/admin (admin/admin)

### Kubernetes (Minikube)
Start Minikube
minikube start --driver=docker
eval $(minikube docker-env)

Build images
docker build -t semiconductor-api:latest ./backend
docker build -t semiconductor-frontend:latest ./frontend
docker build -t semiconductor-simulator:latest -f data-simulator/Dockerfile .

Deploy
kubectl apply -f k8s/deployment.yaml

Port forward
kubectl port-forward -n semiconductor service/frontend 8080:80
kubectl port-forward -n semiconductor service/api 8000:8000

## 🔑 Login Credentials

Employee Login: employee / employee123
Admin Login: admin / admin123
Keycloak Admin: admin / admin
Grafana: admin / admin

## 🧠 ML-Based Predictive Maintenance

The platform uses a Random Forest ML model to predict equipment failures based on:
- Operating hours
- Temperature
- Vibration
- Age
- Maintenance history

### How It Works
1. Equipment data is collected from the simulator
2. ML model analyzes patterns and predicts failure probability
3. Health score (0-100%) is calculated
4. Priority levels (Urgent/High/Medium/Low) are assigned
5. Recommended actions are generated

## 🔐 Security Architecture

### Keycloak Integration
- Centralized identity management
- Role-based access control (Admin/Employee)
- Single Sign-On (SSO)
- JWT token authentication

### Network Security (Kubernetes)
- Network policies restrict service-to-service communication
- Only authorized services can access databases
- API exposed only to frontend and simulator

## 📊 Monitoring Stack

### Prometheus
- Collects API metrics (requests, errors, latency)
- Time-series database for operational data
- Query with PromQL

### Grafana
- Pre-built dashboards for API and equipment metrics
- Visualize health scores and predictions
- Alerting on threshold breaches

## 🛠️ Technology Stack

Backend: FastAPI, Python, Scikit-learn
Frontend: React, TypeScript, Vite
Database: PostgreSQL, Redis
Identity: Keycloak
Monitoring: Prometheus, Grafana
Container: Docker, Kubernetes
CI/CD: GitHub Actions, Jenkins

## 📁 Project Structure

semiconductor-platform/
backend/
  app/
    api/          API endpoints
    core/         Security, database
    models/       Database models
    services/     ML, predictive maintenance
  requirements.txt
frontend/
  src/
    components/   React components
    services/     API services
  package.json
k8s/                  Kubernetes manifests
keycloak/             Keycloak realm config
monitoring/           Prometheus/Grafana
docs/                 Documentation

## 📚 Documentation

Installation Guide: docs/INSTALLATION.md
Deployment Guide: docs/DEPLOYMENT.md
User Guide: docs/USER_GUIDE.md
Admin Guide: docs/ADMIN_GUIDE.md
ML Guide: docs/ML_GUIDE.md
Kubernetes Guide: docs/KUBERNETES_GUIDE.md
Security Guide: docs/SECURITY_GUIDE.md
Troubleshooting: docs/TROUBLESHOOTING.md

## 🔒 Standards Compliance

SEMI E10 – Equipment Reliability
SEMI E79 – Equipment Performance
IEC 62443 – Industrial Security
ISO 9001 – Quality Management
ISO 55001 – Asset Management
ISO/IEC 27001 – Information Security
NIST CSF 2.0 – Cybersecurity
NIST SP 800-82 – OT Security
ISA-95 – Enterprise Integration
COBIT 2019 – IT Governance
ITIL 4 – Service Management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is for educational purpose. 
