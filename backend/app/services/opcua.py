"""
OPC UA Integration for Semiconductor Manufacturing Platform
Full OPC UA server implementation with equipment monitoring
"""

import asyncio
import random
import logging
from datetime import datetime
from typing import Dict, Any
import threading
import time

try:
    from opcua import Server, ua
    OPCUA_AVAILABLE = True
except ImportError:
    OPCUA_AVAILABLE = False
    logging.warning("OPC UA library not installed. Install with: pip install opcua-asyncio")

logger = logging.getLogger(__name__)

class OPCUAServer:
    """OPC UA server for equipment monitoring"""
    
    def __init__(self):
        self.server = None
        self.is_running = False
        self.equipment_nodes = {}
        self.equipment_data: Dict[str, Dict[str, Any]] = {}
        
    def register_equipment(self, equipment_id: str, equipment_data: Dict):
        """Register equipment with OPC UA server"""
        if not OPCUA_AVAILABLE:
            logger.info(f"OPC UA not available - simulating registration for {equipment_id}")
            self.equipment_data[equipment_id] = equipment_data
            return
        
        self.equipment_data[equipment_id] = equipment_data
        
    def update_equipment_data(self, equipment_id: str):
        """Update simulated equipment data"""
        if equipment_id not in self.equipment_data:
            return
            
        data = self.equipment_data[equipment_id]
        data['temperature'] = round(random.uniform(20, 30), 2)
        data['pressure'] = round(random.uniform(0.8, 1.5), 3)
        data['vibration'] = round(random.uniform(0.1, 1.0), 3)
        data['power_consumption'] = round(random.uniform(80, 150), 2)
        data['operating_hours'] = data.get('operating_hours', 0) + round(random.uniform(0.5, 2), 2)
        data['last_updated'] = datetime.utcnow().isoformat()
        
    def get_equipment_data(self, equipment_id: str) -> Dict[str, Any]:
        """Get current OPC UA data for equipment"""
        if equipment_id not in self.equipment_data:
            return {}
        return self.equipment_data[equipment_id]
        
    def get_all_equipment_data(self) -> Dict[str, Dict[str, Any]]:
        """Get all equipment data"""
        return self.equipment_data
        
    def start(self):
        """Start OPC UA server"""
        if not OPCUA_AVAILABLE:
            logger.info("OPC UA server running in simulation mode")
            self.is_running = True
            return
            
        try:
            self.server = Server()
            self.server.set_endpoint("opc.tcp://0.0.0.0:4840/freeopcua/server/")
            self.server.set_server_name("Semiconductor Equipment OPC UA Server")
            
            # Create namespace
            uri = "http://semiconductor.opcua"
            idx = self.server.register_namespace(uri)
            
            # Create objects for equipment
            objects = self.server.get_objects_node()
            
            for eq_id, eq_data in self.equipment_data.items():
                # Create equipment folder
                eq_folder = objects.add_object(idx, eq_id)
                
                # Add variables
                for key, value in eq_data.items():
                    var = eq_folder.add_variable(idx, key, value)
                    var.set_writable(True)
                    self.equipment_nodes[f"{eq_id}_{key}"] = var
            
            self.server.start()
            self.is_running = True
            logger.info(f"OPC UA server started on port 4840 with {len(self.equipment_data)} equipment items")
            
        except Exception as e:
            logger.error(f"Failed to start OPC UA server: {e}")
            self.is_running = False
    
    def update_opcua_nodes(self, equipment_id: str, data: Dict):
        """Update OPC UA nodes with latest data"""
        if not self.is_running or not self.server:
            return
            
        try:
            for key, value in data.items():
                node_key = f"{equipment_id}_{key}"
                if node_key in self.equipment_nodes:
                    self.equipment_nodes[node_key].set_value(value)
        except Exception as e:
            logger.error(f"Failed to update OPC UA nodes: {e}")
    
    def stop(self):
        """Stop OPC UA server"""
        self.is_running = False
        if self.server:
            self.server.stop()
            logger.info("OPC UA server stopped")

# Create global instance
opcua_server = OPCUAServer()

# Auto-start on import if running in main thread
def start_opcua():
    if OPCUA_AVAILABLE:
        opcua_server.start()
    else:
        logger.warning("OPC UA not available - running in simulation mode")
        opcua_server.is_running = True

# Start OPC UA server in background thread
def start_opcua_thread():
    thread = threading.Thread(target=start_opcua, daemon=True)
    thread.start()
    return thread

# Initialize if not imported
if __name__ != "__main__":
    start_opcua_thread()
