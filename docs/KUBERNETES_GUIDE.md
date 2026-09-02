# Kubernetes Deployment Guide

-disclaimer you can access the frontend and backend and simulator but you won't get grafana, prometheus or keylock by using this method to launch the project. 

## Prerequisites

- Minikube installed
- kubectl installed
- Docker installed
- Min. 4GB RAM available

## Installation

### Install Minikube
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Install kubectl
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Getting the repo files on your computer.
```bash
#to clone directory
git clone https://github.com/maryam-batool-cat/Semiconductor-platform.git
```

## Start Minikube
```bash
minikube start --driver=docker
minikube status
```

## Set Docker to Use Minikube
```bash
eval $(minikube docker-env)
```

## Build Images
```bash
cd ~/semiconductor-platform
docker build -t semiconductor-api:latest ./backend
docker build -t semiconductor-frontend:latest ./frontend
docker build -t semiconductor-simulator:latest -f data-simulator/Dockerfile .
```

## Deploy to Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
```

## Check Deployment Status
```bash
kubectl get pods -n semiconductor
kubectl get services -n semiconductor
```

## Port Forward to Access
```bash
kubectl port-forward -n semiconductor service/api 8000:8000
```
In a different tab run this
```bash
kubectl port-forward -n semiconductor service/frontend 8080:80
```

## Access Applications
Frontend: http://localhost:8080
API: http://localhost:8000
API Docs: http://localhost:8000/docs

## Scaling
```bash
#Scale API deployment
kubectl scale -n semiconductor deployment/api --replicas=3

#Scale frontend deployment
kubectl scale -n semiconductor deployment/frontend --replicas=2
```

## Updating
```bash
#Rebuild image with new code
docker build -t semiconductor-api:latest ./backend

#Restart deployment
kubectl rollout restart -n semiconductor deployment/api
```

## Network Policies

The platform uses network policies to restrict communication:
- Only API can talk to PostgreSQL
- Only Frontend can talk to API
- Only Simulator can talk to API

Apply network policies
```bash
kubectl apply -f k8s/network-policy.yaml
```

## Troubleshooting

### Pods Not Starting
```bash
#Check pod status: 
kubectl get pods -n semiconductor

#Check logs: 
kubectl logs -n semiconductor <pod-name>

#Describe pod: 
kubectl describe pod -n semiconductor <pod-name>
```
### ImagePullBackOff
Images not found in Minikube
Rebuild images with: 
```bash
eval $(minikube docker-env)
```
Then rebuild: 
```bash
docker build -t semiconductor-api:latest ./backend
```

### CrashLoopBackOff
Check logs: 
```bash
kubectl logs -n semiconductor <pod-name>
```
Check database connection
Verify environment variables

### Port Forward Failing
```bash
#Check if service exists: 
kubectl get services -n semiconductor

#Check if pods are running: 
kubectl get pods -n semiconductor

#Use different local port: 
kubectl port-forward -n semiconductor service/frontend 8081:80
```

## Clean Up

Delete all resources
```bash
kubectl delete namespace semiconductor
```

Stop Minikube
```bash
minikube stop
```

Delete Minikube
```bash
minikube delete
```
