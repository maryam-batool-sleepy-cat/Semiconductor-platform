# Kubernetes Deployment Guide

## Prerequisites

- Minikube installed
- kubectl installed
- Docker installed
- Min. 4GB RAM available

## Installation

### Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

sudo install minikube-linux-amd64 /usr/local/bin/minikube

### Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

## Start Minikube

minikube start --driver=docker
minikube status

## Set Docker to Use Minikube

eval $(minikube docker-env)

## Build Images

cd ~/semiconductor-platform
docker build -t semiconductor-api:latest ./backend
docker build -t semiconductor-frontend:latest ./frontend
docker build -t semiconductor-simulator:latest -f data-simulator/Dockerfile .

## Deploy to Kubernetes

kubectl apply -f k8s/deployment.yaml

## Check Deployment Status

kubectl get pods -n semiconductor
kubectl get services -n semiconductor

## Port Forward to Access

kubectl port-forward -n semiconductor service/api 8000:8000
kubectl port-forward -n semiconductor service/frontend 8080:80

## Access Applications

Frontend: http://localhost:8080
API: http://localhost:8000
API Docs: http://localhost:8000/docs

## Scaling

Scale API deployment
kubectl scale -n semiconductor deployment/api --replicas=3

Scale frontend deployment
kubectl scale -n semiconductor deployment/frontend --replicas=2

## Updating

Rebuild image with new code
docker build -t semiconductor-api:latest ./backend

Restart deployment
kubectl rollout restart -n semiconductor deployment/api

## Network Policies

The platform uses network policies to restrict communication:
- Only API can talk to PostgreSQL
- Only Frontend can talk to API
- Only Simulator can talk to API

Apply network policies
kubectl apply -f k8s/network-policy.yaml

## Troubleshooting

### Pods Not Starting
Check pod status: kubectl get pods -n semiconductor
Check logs: kubectl logs -n semiconductor <pod-name>
Describe pod: kubectl describe pod -n semiconductor <pod-name>

### ImagePullBackOff
Images not found in Minikube
Rebuild images with: eval $(minikube docker-env)
Then rebuild: docker build -t semiconductor-api:latest ./backend

### CrashLoopBackOff
Check logs: kubectl logs -n semiconductor <pod-name>
Check database connection
Verify environment variables

### Port Forward Failing
Check if service exists: kubectl get services -n semiconductor
Check if pods are running: kubectl get pods -n semiconductor
Use different local port: kubectl port-forward -n semiconductor service/frontend 8081:80

## Clean Up

Delete all resources
kubectl delete namespace semiconductor

Stop Minikube
minikube stop

Delete Minikube
minikube delete

