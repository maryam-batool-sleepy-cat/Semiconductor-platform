# Deployment Guide

## Docker Compose
sudo docker-compose up -d

## Kubernetes
kubectl create namespace semiconductor
kubectl apply -f k8s/ -n semiconductor
(UNDER CONSTRUCTION) 

## Terraform (AWS)
cd terraform
terraform init
terraform apply -auto-approve

## Environment Variables
Create backend/.env:
DATABASE_URL=postgresql://postgres:password@postgres:5432/semiconductor
REDIS_URL=redis://redis:6379
SECRET_KEY=your-secret-key

## Health Checks
curl http://localhost:8000/health
sudo docker-compose ps

## Backup
sudo docker exec -t semiconductor-postgres pg_dump -U postgres semiconductor > backup.sql
