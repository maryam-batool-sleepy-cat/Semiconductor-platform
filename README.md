# Semiconductor Manufacturing Operations Platform

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
- JWT Token Security - Secure API access

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11+
- Node.js 18+

### Docker Compose
Clone the repository:
```bash
git clone https://github.com/maryam-batool-sleepy-cat/Semiconductor-platform.git

cd Semiconductor-platform
```

Start all services:
```bash
sudo docker-compose up -d

Start the data simulator:

source backend/venv/bin/activate

pip install -r backend/requirements.txt

python3 data-simulator/simulate.py
```

start frontend:
```bash
cd frontend

npm run dev
```

Access the platform:
Frontend: http://localhost:5173
API: http://localhost:8000
API Docs: http://localhost:8000/docs

## 🔑 Login Credentials

Employee Login: employee / employee123
Admin Login: admin / admin123
Grafana admin / admin

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

### Prometheus
- Collects API metrics (requests, errors, latency)
- Time-series database for operational data
-  http://localhost:9090/targets
-  http://localhost:9090/query?g0.expr=up&g0.show_tree=0&g0.tab=graph&g0.range_input=1h&g0.res_type=auto&g0.res_density=medium&g0.display_mode=lines&g0.show_exemplars=0

### Grafana
- Visualize health scores and predictions
- http://localhost:3000

### Loki & Promtail
- Centralized log aggregation
- Automatic log collection from all containers
- Query logs by container or service
- (for promtail loki can be seen only through command line) http://localhost:9080/

## 🔐 Security
### JWT Authentication
- All API endpoints protected with JWT tokens
- Tokens expire after 30 minutes (regenerates on its own)
- Role-based access control (Admin/Employee)

## 🛠️ Technology Stack
- Backend: FastAPI, Python
- Frontend: React, TypeScript, Vite
- Database: PostgreSQL, Redis
- Monitoring: Prometheus, Grafana, Loki
- Logging: Promtail
- Integration: Node-RED, OPC UA, Kafka, MQTT
- Security: JWT
- Container: Docker, Kubernetes
- CI/CD: GitHub Actions

## 📚 Documentation
- Role-based access control (Admin/Employee)
- Installation Guide: docs/INSTALLATION.md
- User Guide: docs/USER_GUIDE.md
- Admin Guide: docs/ADMIN_GUIDE.md
- ML Guide: docs/ML_GUIDE.md
- Kubernetes Guide: docs/KUBERNETES_GUIDE.md
- Troubleshooting: docs/TROUBLESHOOTING.md

## 🧪 Testing

Run all tests:
```bash
cd backend
python -m pytest tests/test_all.py -v
```
Expected: 8/16 passed

## 📄 License

This project is for educational purposes.

---
