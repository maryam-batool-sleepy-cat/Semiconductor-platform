# 🏭 Semiconductor Manufacturing Operations Platform

Enterprise platform for monitoring semiconductor fabrication. (Built on feodra workstation 44)

## Features
- Wafer Production Management
- Equipment Health Monitoring
- Predictive Maintenance
- Yield Analytics
- Executive Dashboard
- Admin Dashboard

## Tech Stack
- Backend: FastAPI, Python
- Frontend: React, TypeScript, Vite
- Database: PostgreSQL, Redis
- Container: Docker
- Monitoring: Prometheus, Grafana

## Quick Start
```bash
#Install first but if installed then
systemctl status docker
systemctl start docker
cd semiconductor-platform
source venv/bin/activate
sudo docker-compose down -v
sudo docker volume rm semiconductor-platform_postgres_data 2>/dev/null || true
sudo docker-compose up -d
echo "Waiting for services to start..."
sleep 20
sudo docker-compose ps
curl http://localhost:8000/health
sleep 20
cd ~/semiconductor-platform
python3 data-simulator/simulate.py &
cd frontend
npm run dev
```
## To Stop 
# To stop frontend press ctrl c then copy paste the following command to stop the backend
```bash
cd semiconductor-platform
pkill -f simulate.py
pkill -f "node.*react-scripts"
sudo docker-compose down -v
```

