# Installation Guide - Semiconductor Manufacturing Platform

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4GB | 8GB+ |
| Disk Space | 20GB | 50GB+ |
| OS | Linux (Fedora workstation (it was built on fedora workstation 44)|
| Docker | 20.10+ | Latest |
| Python | 3.9+ | 3.11+ |
| Node.js | 16+ | 18+ |

## Step 1: Prerequisites

### Install Docker and Docker Compose

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker

# Fedora
sudo dnf install docker docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker

### Install Python
# Ubuntu/Debian
sudo apt install python3 python3-pip python3-venv -y

# Fedora
sudo dnf install python3 python3-pip python3-virtualenv -y

### Install Node.js
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Fedora
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install nodejs -y
```

## Step 2: Clone Repository
```bash
git clone https://github.com/maryam-batool-cat/Semiconductor-platform.git
cd Semiconductor-platform
```

## Step 3: Build Enviorment Simulation and Frontend. 
```bash

#go to frontend directory and install
cd frontend
npm install

#go back to main direcotry
cd semiconductor-platform / cd..

# Create virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate 
exit

#checking to see if enviroment works

# Install Python dependencies
pip install -r backend/requirements.txt
```

## Step 4: Makea few files on your main directory (fedora in this case)
#move to your user account (fedora in this case)
```bash

cd Fedora

# Create file
bash
vim StartPlatform (or any name you want)

# Inside the file add the following 
#!/bin/bash
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

#save the file

#then create file to stop the system
bash
vim stopplatform (or what ever name you want)

# then put this in the file
#!/bin/bash
cd semiconductor-platform
pkill -f simulate.py
pkill -f "node.*react-scripts"
sudo docker-compose down -v

#Start Platform
bash

#stay in your user directory (this case fedora)
cd fedora 

#Then run the file we made
bash StartPlatform

#if docker already running press q and give all credntials it will work. 
```

## Step 5: Verify Installation

Service	Check
API	curl http://localhost:8000/health
Frontend	Open http://localhost:5173
Database	sudo docker exec -it semiconductor-postgres psql -U postgres -d semiconductor -c "\dt"

## Step 6: Login
Role - Username - Password
Employee - employee - employee123
Admin - admin - admin123

## Step 7: How To Stop
#When to stop you cut off the frontend by ctrl c
#For the backend you run the other file we mad
```bash
bash stopplatform

