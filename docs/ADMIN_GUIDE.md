### Administrator Guide - Semiconductor Manufacturing Platform

## System Administration

# Access Admin Dashboard
1. Login as admin (admin/admin123)
2. Go to Admin Dashboard
3. View executive KPIs and reports

# User Management
Users are managed via hardcoded credentials:

Employee: employee / employee123
Admin: admin / admin123

To add users, modify the login handlers in:
- frontend/src/components/EmployeeLogin.tsx
- frontend/src/components/AdminLogin.tsx

## Authentication

# JWT Token System
- All API endpoints require JWT tokens
- Tokens expire after 30 minutes
- The system auto-refreshes tokens
- Tokens include user role information

# Token Management
To manually get a token:
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

## System Monitoring

# Health Checks
~Check API health
curl http://localhost:8000/health

~Check database
sudo docker exec -it semiconductor-postgres pg_isready -U postgres

~Check all containers
sudo docker-compose ps

# Logs
~View API logs
sudo docker-compose logs api -f

~View database logs
sudo docker-compose logs postgres -f

~View all logs
sudo docker-compose logs -f

## Monitoring Stack
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)
(only on local method using docker compose)

## Backup Procedures

# Database Backup
# Create backup
sudo docker exec -t semiconductor-postgres pg_dump -U postgres semiconductor > backup.sql

# Restore
cat backup.sql | sudo docker exec -i semiconductor-postgres psql -U postgres semiconductor

# Automated Backups
Create backup.sh:
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups
sudo docker exec -t semiconductor-postgres pg_dump -U postgres semiconductor > backups/backup_$DATE.sql
find backups -name "*.sql" -mtime +7 -delete

## Running Tests

# Run all tests
cd backend
python -m pytest tests/test_all.py -v
# Expected: 16 passed

## Troubleshooting

# API Not Responding
sudo docker-compose logs api
sudo docker-compose restart api

# Database Connection Error
sudo docker-compose restart postgres
sudo docker-compose restart api

# Frontend Not Loading
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev

## Simulator Issues
# Check token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Restart simulator
python3 data-simulator/simulate.py

## Security Notes

- JWT tokens are the primary authentication method
- All API endpoints are protected
- Role-based access control is implemented
- Network policies restrict service access in Kubernetes
-recommended to change the passwords through the code. 
---
