# Integration Points

## Future Extensibility

This platform includes several services that are configured but not currently active, representing its readiness for enterprise-scale deployment.

### Apache Kafka (Port 9092)
**Purpose:** Message streaming and event-driven architecture  
**Status:** Configured, not actively used  
**Future Use:** Equipment telemetry streaming, real-time alerts, data pipeline

### MQTT Broker (Port 1883)
**Purpose:** IoT sensor data ingestion  
**Status:** Configured, not actively used  
**Future Use:** Connecting to factory floor sensors, edge devices

### Redis Cache (Port 6379)
**Purpose:** Caching and session storage  
**Status:** Running but not actively used  
**Future Use:** Performance optimization, session management

### OPC UA (Simulated)
**Purpose:** Industrial equipment communication  
**Status:** Implemented but not active  
**Future Use:** Real-time equipment monitoring, SCADA integration

## Kafka Streaming Architecture (Planned)
Equipment Data → MQTT → Kafka → FastAPI → Database
↓
Real-time Analytics
↓
Alerting System

## OPC UA Integration (Planned)
Equipment → OPC UA Server → Data Collector → PostgreSQL → Dashboard

These services are ready to be enabled when the platform is deployed in a production environment.
