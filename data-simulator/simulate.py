#!/usr/bin/env python3
import random
import time
import json
import requests
from datetime import datetime, timedelta
import threading
import logging
import sys
import os

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SemiconductorSimulator:
    def __init__(self):
        # TRY LOCALHOST FIRST - not api:8000
        self.api_urls = [
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            os.environ.get('API_URL', 'http://api:8000')
        ]
        self.api_url = None
        self.token = None
        self.token_expiry = None
        self.base_url = None
        self.batch_counter = random.randint(1000, 9999)
        self.running = True
        self.equipment_data = [
            {"equipment_id": "LITHO-001", "name": "ASML NXT:1980", "type": "lithography", "model": "NXT:1980", "manufacturer": "ASML"},
            {"equipment_id": "LITHO-002", "name": "ASML NXT:2000", "type": "lithography", "model": "NXT:2000", "manufacturer": "ASML"},
            {"equipment_id": "ETCH-001", "name": "Lam Research 2300", "type": "etching", "model": "2300", "manufacturer": "Lam Research"},
            {"equipment_id": "ETCH-002", "name": "Lam Research 2400", "type": "etching", "model": "2400", "manufacturer": "Lam Research"},
            {"equipment_id": "DEPO-001", "name": "Applied Materials Endura", "type": "deposition", "model": "Endura", "manufacturer": "Applied Materials"},
            {"equipment_id": "DEPO-002", "name": "Applied Materials Producer", "type": "deposition", "model": "Producer", "manufacturer": "Applied Materials"},
            {"equipment_id": "INSP-001", "name": "KLA-Tencor 2900", "type": "inspection", "model": "2900", "manufacturer": "KLA-Tencor"},
            {"equipment_id": "INSP-002", "name": "KLA-Tencor 2950", "type": "inspection", "model": "2950", "manufacturer": "KLA-Tencor"}
        ]
    
    def get_token(self, force=False):
        """Get JWT token from API with retry logic"""
        if not force and self.token and self.token_expiry:
            if datetime.now() < self.token_expiry:
                return True
        
        logger.info("🔄 Getting JWT token...")
        
        for url in self.api_urls:
            try:
                logger.debug(f"Trying URL: {url}")
                response = requests.post(
                    f"{url}/api/v1/auth/login",
                    json={"username": "admin", "password": "admin123"},
                    timeout=3
                )
                if response.status_code == 200:
                    data = response.json()
                    self.token = data.get('access_token')
                    self.token_expiry = datetime.now() + timedelta(minutes=25)
                    self.api_url = url
                    self.base_url = f"{url}/api/v1"
                    logger.info(f"✅ Got JWT token from {url}")
                    return True
                else:
                    logger.debug(f"Login returned {response.status_code}")
            except Exception as e:
                logger.debug(f"Token attempt on {url} failed: {e}")
            time.sleep(1)
        
        logger.error("❌ Failed to get JWT token")
        return False
    
    def get_headers(self):
        """Get headers with JWT token, auto-refresh if needed"""
        if not self.token or not self.token_expiry or datetime.now() > self.token_expiry:
            logger.info("⏰ Refreshing token...")
            self.get_token(force=True)
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def wait_for_api(self):
        logger.info("Waiting for API to be ready...")
        for i in range(30):
            try:
                response = requests.get("http://localhost:8000/health", timeout=2)
                if response.status_code == 200:
                    self.api_url = "http://localhost:8000"
                    self.base_url = "http://localhost:8000/api/v1"
                    logger.info(f"API is ready at: {self.api_url}")
                    return True
            except:
                pass
            time.sleep(2)
        logger.error("API not ready after 30 attempts")
        return False
    
    def register_equipment(self):
        logger.info("Registering equipment...")
        for eq in self.equipment_data:
            try:
                response = requests.post(
                    f"{self.base_url}/equipment/",
                    json=eq,
                    headers=self.get_headers(),
                    timeout=5
                )
                if response.status_code in [200, 201]:
                    logger.info(f"✅ Registered: {eq['equipment_id']}")
                elif response.status_code == 400:
                    logger.info(f"⏭️ Already exists: {eq['equipment_id']}")
                else:
                    logger.warning(f"❌ Failed {eq['equipment_id']}: {response.status_code}")
            except Exception as e:
                logger.error(f"Error registering {eq['equipment_id']}: {e}")
    
    def create_batch(self):
        self.batch_counter += 1
        batch_data = {
            "batch_name": f"BATCH-{self.batch_counter:05d}",
            "product_type": random.choice(["AI-Accelerator", "Automotive", "Mobile", "Data-Center", "IoT"]),
            "total_wafers": random.randint(20, 30)
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/wafers/batches",
                json=batch_data,
                headers=self.get_headers(),
                timeout=10
            )
            if response.status_code == 200:
                batch = response.json()
                logger.info(f"✅ Created: {batch['batch_name']} ({batch['total_wafers']} wafers)")
                return batch
            elif response.status_code == 401:
                logger.warning("⚠️ Token expired, refreshing...")
                self.get_token(force=True)
                return self.create_batch()
            else:
                logger.error(f"❌ Failed to create batch: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"❌ Error creating batch: {e}")
            return None
    
    def simulate_production(self, batch_id):
        stages = ["lithography", "etching", "deposition", "inspection"]
        
        for stage in stages:
            if not self.running:
                break
                
            logger.info(f"⏳ Stage: {stage} for batch {batch_id}")
            time.sleep(random.uniform(2, 4))
            
            try:
                response = requests.get(
                    f"{self.base_url}/wafers/batches/{batch_id}/history",
                    headers=self.get_headers(),
                    timeout=5
                )
                if response.status_code == 200:
                    batch_data = response.json()
                    for wafer in batch_data.get('wafers', []):
                        try:
                            wafer_id = wafer['wafer_id']
                            requests.patch(
                                f"{self.base_url}/wafers/wafers/{wafer_id}/stage",
                                json={"stage": stage},
                                headers=self.get_headers(),
                                timeout=5
                            )
                            
                            if stage == "inspection":
                                yield_data = {
                                    "wafer_id": wafer['id'],
                                    "process_stage": stage,
                                    "defect_count": random.randint(0, 5),
                                    "yield_percentage": round(random.uniform(85, 98), 2),
                                    "quality_score": round(random.uniform(80, 99), 2),
                                    "parameters": json.dumps({
                                        "temperature": round(random.uniform(20, 25), 1),
                                        "pressure": round(random.uniform(0.5, 1.2), 2),
                                        "time": round(random.uniform(10, 30), 1)
                                    })
                                }
                                requests.post(
                                    f"{self.base_url}/yield/",
                                    json=yield_data,
                                    headers=self.get_headers(),
                                    timeout=5
                                )
                        except Exception as e:
                            logger.error(f"Wafer error: {e}")
                    
                    logger.info(f"✅ Completed: {stage}")
                elif response.status_code == 401:
                    logger.warning("⚠️ Token expired, refreshing...")
                    self.get_token(force=True)
                    self.simulate_production(batch_id)
                    return
                else:
                    logger.warning(f"Failed to get batch history: {response.status_code}")
            except Exception as e:
                logger.error(f"Stage error: {e}")
    
    def simulate_equipment_monitoring(self):
        logger.info("Starting equipment monitoring...")
        while self.running:
            try:
                response = requests.get(
                    f"{self.base_url}/equipment/",
                    headers=self.get_headers(),
                    timeout=5
                )
                if response.status_code == 200:
                    equipment_list = response.json()
                    for eq in equipment_list:
                        try:
                            eq_id = eq['equipment_id']
                            hours = round(random.uniform(2, 8), 2)
                            requests.post(
                                f"{self.base_url}/equipment/{eq_id}/utilization",
                                json={"hours": hours},
                                headers=self.get_headers(),
                                timeout=5
                            )
                        except Exception as e:
                            pass
                time.sleep(30)
            except Exception as e:
                logger.error(f"Monitoring error: {e}")
                time.sleep(10)
    
    def run_simulation(self):
        logger.info("="*60)
        logger.info("🏭 Semiconductor Manufacturing Simulation")
        logger.info("="*60)
        
        if not self.wait_for_api():
            logger.error("Cannot start - API not available")
            return
        
        while not self.get_token():
            logger.warning("⚠️ Retrying token...")
            time.sleep(5)
        
        self.register_equipment()
        
        monitor_thread = threading.Thread(target=self.simulate_equipment_monitoring, daemon=True)
        monitor_thread.start()
        
        try:
            while self.running:
                batch = self.create_batch()
                if batch:
                    self.simulate_production(batch['id'])
                delay = random.uniform(15, 45)
                logger.info(f"⏰ Waiting {delay:.1f}s...")
                time.sleep(delay)
        except KeyboardInterrupt:
            logger.info("\n⏹️ Stopped")
        except Exception as e:
            logger.error(f"❌ Error: {e}")
        finally:
            self.running = False
            logger.info("🏁 Simulation ended")

if __name__ == "__main__":
    simulator = SemiconductorSimulator()
    simulator.run_simulation()
