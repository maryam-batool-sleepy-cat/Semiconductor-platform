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

## Health Checks
```bash
curl http://localhost:8000/health
sudo docker-compose ps
```

## Backup
```bash
sudo docker exec -t semiconductor-postgres pg_dump -U postgres semiconductor > backup.sql
```
