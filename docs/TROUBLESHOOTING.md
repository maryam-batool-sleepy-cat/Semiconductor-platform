# Troubleshooting Guide

## Common Issues and Solutions

### 1. Docker Containers Won't Start

Solution:
sudo docker-compose down -v
sudo docker-compose up -d

Check logs:
sudo docker-compose logs

### 2. Port Already in Use

Find process:
sudo lsof -i :8000

Kill process:
sudo kill -9 <PID>

### 3. API Not Responding

Check if running:
sudo docker-compose ps api

Check logs:
sudo docker-compose logs api --tail=50

Restart:
sudo docker-compose restart api

### 4. Database Connection Error

Check PostgreSQL:
sudo docker-compose ps postgres
sudo docker-compose logs postgres --tail=30

Restart:
sudo docker-compose restart postgres
sudo docker-compose restart api

### 5. Frontend White Page

Check browser console for errors
Clear browser cache
Restart frontend:
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev

### 6. CORS Errors

Check main.py CORS configuration:
allow_origins should include http://localhost:5173
Restart API: sudo docker-compose restart api

### 7. Keycloak Login Fails

Check Keycloak status:
sudo docker-compose ps keycloak
sudo docker-compose logs keycloak --tail=30

Recreate realm:
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8081/realms/master/protocol/openid-connect/token -H "Content-Type: application/x-www-form-urlencoded" -d "client_id=admin-cli" -d "username=admin" -d "password=admin" -d "grant_type=password" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")
curl -X POST http://localhost:8081/admin/realms -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"realm":"semiconductor","enabled":true}'

### 8. Grafana Redirect Loop

Reset Grafana:
sudo docker-compose stop grafana
sudo rm -rf monitoring/grafana
mkdir -p monitoring/grafana
sudo chown -R 472:472 monitoring/grafana/
sudo chmod -R 755 monitoring/grafana/
sudo docker-compose up -d grafana

### 9. Prometheus No Data

Check target status:
curl http://localhost:9090/api/v1/targets

Restart:
sudo docker-compose restart prometheus

Check query:
curl "http://localhost:9090/api/v1/query?query=up"

### 10. ML Model Not Working

Check API logs:
sudo docker-compose logs api --tail=30

Verify model:
curl http://localhost:8000/api/v1/maintenance/predictions

Ensure data exists:
curl http://localhost:8000/api/v1/equipment/

### 11. Kubernetes Connection Refused

Start Minikube:
minikube start --driver=docker

Check status:
minikube status

Set context:
kubectl config use-context minikube

### 12. ImagePullBackOff in Kubernetes

Set Docker to Minikube:
eval $(minikube docker-env)

Rebuild:
docker build -t semiconductor-api:latest ./backend
docker build -t semiconductor-frontend:latest ./frontend

Restart pods:
kubectl delete pods -n semiconductor --all

## Log Locations

Docker logs:
sudo docker-compose logs -f api
sudo docker-compose logs -f postgres
sudo docker-compose logs -f frontend

Kubernetes logs:
kubectl logs -n semiconductor <pod-name>

Frontend logs:
cd frontend
npm run dev

Backend logs:
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

## Quick Fix Commands

Restart everything:
sudo docker-compose down && sudo docker-compose up -d

Reset database:
sudo docker-compose down -v
sudo docker-compose up -d

Clear frontend cache:
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

Reset Grafana:
sudo docker-compose stop grafana
sudo rm -rf monitoring/grafana
mkdir -p monitoring/grafana
sudo chown -R 472:472 monitoring/grafana/
sudo chmod -R 755 monitoring/grafana/
sudo docker-compose up -d grafana


