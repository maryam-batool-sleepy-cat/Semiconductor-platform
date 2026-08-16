# Deployment Guide

## Docker Compose
```bash
sudo docker-compose up -d
 
```
## Terraform (AWS)
```bash
cd terraform
terraform init
terraform apply -auto-approve
```

## Environment Variables
```bash
Create backend/.env:
DATABASE_URL=postgresql://postgres:password@postgres:5432/semiconductor
REDIS_URL=redis://redis:6379
SECRET_KEY=your-secret-key
```

## Health Checks
```bash
curl http://localhost:8000/health
sudo docker-compose ps
```

## Backup
```bash
sudo docker exec -t semiconductor-postgres pg_dump -U postgres semiconductor > backup.sql
```
