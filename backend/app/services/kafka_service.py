"""
Apache Kafka Service for Equipment Telemetry
"""

import json
import threading
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Callable
import time

try:
    from kafka import KafkaProducer, KafkaConsumer
    from kafka.errors import NoBrokersAvailable
    KAFKA_AVAILABLE = True
except ImportError:
    KAFKA_AVAILABLE = False
    logging.warning("Kafka library not installed. Install with: pip install kafka-python")

logger = logging.getLogger(__name__)

class KafkaService:
    """Kafka service for equipment telemetry"""
    
    def __init__(self, bootstrap_servers='localhost:9092'):
        self.bootstrap_servers = bootstrap_servers
        self.producer = None
        self.consumers = {}
        self.is_connected = False
        self.topics = {
            'equipment_telemetry': 'equipment.telemetry',
            'maintenance_alerts': 'maintenance.alerts',
            'wafer_events': 'wafer.events',
            'yield_data': 'yield.data'
        }
        
    def connect(self):
        """Connect to Kafka broker"""
        if not KAFKA_AVAILABLE:
            logger.warning("Kafka library not available - running in simulation mode")
            self.is_connected = True
            return True
            
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                retries=3
            )
            self.is_connected = True
            logger.info(f"Kafka connected to {self.bootstrap_servers}")
            return True
        except NoBrokersAvailable:
            logger.warning("No Kafka brokers available - running in simulation mode")
            self.is_connected = True
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            self.is_connected = True  # Run in simulation mode
            return True
    
    def send_telemetry(self, equipment_id: str, data: Dict[str, Any]):
        """Send equipment telemetry to Kafka"""
        if not self.is_connected:
            self.connect()
            
        message = {
            'equipment_id': equipment_id,
            'timestamp': datetime.utcnow().isoformat(),
            'data': data
        }
        
        try:
            if self.producer and KAFKA_AVAILABLE:
                self.producer.send(self.topics['equipment_telemetry'], message)
                self.producer.flush()
                logger.debug(f"Telemetry sent for {equipment_id}")
            else:
                logger.debug(f"Kafka simulation: {equipment_id} telemetry would be sent")
            return True
        except Exception as e:
            logger.error(f"Failed to send telemetry: {e}")
            return False
    
    def send_maintenance_alert(self, equipment_id: str, alert: Dict[str, Any]):
        """Send maintenance alert to Kafka"""
        if not self.is_connected:
            self.connect()
            
        message = {
            'equipment_id': equipment_id,
            'timestamp': datetime.utcnow().isoformat(),
            'alert': alert
        }
        
        try:
            if self.producer and KAFKA_AVAILABLE:
                self.producer.send(self.topics['maintenance_alerts'], message)
                self.producer.flush()
                logger.info(f"Maintenance alert sent for {equipment_id}")
            else:
                logger.info(f"Kafka simulation: maintenance alert for {equipment_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send alert: {e}")
            return False
    
    def start_consumer(self, topic: str, callback: Callable, group_id: str = 'semiconductor-group'):
        """Start a Kafka consumer"""
        if not self.is_connected:
            self.connect()
            
        if topic not in self.consumers:
            try:
                if KAFKA_AVAILABLE:
                    consumer = KafkaConsumer(
                        topic,
                        bootstrap_servers=self.bootstrap_servers,
                        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                        group_id=group_id,
                        auto_offset_reset='earliest'
                    )
                    
                    def consume():
                        for message in consumer:
                            callback(message.value)
                            
                    thread = threading.Thread(target=consume, daemon=True)
                    thread.start()
                    self.consumers[topic] = consumer
                    logger.info(f"Kafka consumer started for {topic}")
                else:
                    logger.info(f"Kafka simulation: consumer for {topic}")
            except Exception as e:
                logger.error(f"Failed to start consumer: {e}")

# Create global instance
kafka_service = KafkaService()

# Auto-connect on import
kafka_service.connect()
