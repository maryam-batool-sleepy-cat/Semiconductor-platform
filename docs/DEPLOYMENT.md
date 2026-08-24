# Deployment Guide

## Docker Compose
```bash
sudo docker-compose up -d
 
```
## kuberenetes
#### prerequisites
Have docker desktop install, minikube, and kubectl installed. (look at the documentation) and having the repo files on your computer. 
```bash
#to clone directory
git clone https://github.com/maryam-batool-cat/Semiconductor-platform.git
```

start minikube 
```bash
minikube start --driver=docker
#checking if its running
minikube status
```

set docker to use minikube
```bash
eval $(minikube docker-env)
```

building the imaiges
```bash
cd ~/semiconductor-platform
docker build -t semiconductor-api:latest ./backend
docker build -t semiconductor-frontend:latest ./frontend
docker build -t semiconductor-simulator:latest -f data-simulator/Dockerfile .
```

applying to deployment
```bash
kubectl apply -f k8s/deployment.yaml
```

checking status
```bash
sleep 30
kubectl get pods -n semiconductor
kubectl cluster-info
kubectl get nodes
```

fowarding port to be able to use it
```bash
# PUT ON DIFFRERENT TABS ON THE TERMINAL

# API Port Forward
kubectl port-forward -n semiconductor service/api 8000:8000 &

# Frontend Port Forward
kubectl port-forward -n semiconductor service/frontend 8080:80 &
```

checking health for kuberentes
```bash
# Test API
curl http://localhost:8000/health

# Test Frontend
curl http://localhost:8080
```
ports 
main site on http://localhost:8080 
API http://localhost:8000
API Docs http://localhost:8000/docs

to stop
to cut the the two port forwarding command

then stop minikube
```bash
minikube stop
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
