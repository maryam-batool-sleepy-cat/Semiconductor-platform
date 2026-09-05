# Node-RED IoT Workflow Guide

## Overview

Node-RED is a visual workflow editor for IoT integration. It lets you connect devices, APIs, and services without writing code.

## Access Node-RED

- URL: http://localhost:1880
- No login required by default

## Basic Workflow Example

1. Open Node-RED at http://localhost:1880
2. Drag an **HTTP In** node from the palette
3. Double-click it and set:
   - Method: GET
   - URL: /equipment
4. Drag an **HTTP Request** node
5. Set URL: http://api:8000/api/v1/equipment/
6. Drag a **Function** node
7. Add this code:
   msg.payload = { equipment: msg.payload, source: "Node-RED", timestamp: new Date().toISOString() }; return msg;
8. Drag an **HTTP Response** node
9. Connect them: HTTP In → HTTP Request → Function → HTTP Response
10. Click **Deploy**

## Test the Flow

curl http://localhost:1880/equipment

## Common Nodes

- **HTTP In**: Receives HTTP requests
- **HTTP Request**: Calls external APIs
- **Function**: JavaScript code
- **MQTT**: Publish/subscribe to MQTT topics
- **Kafka**: Send/receive Kafka messages

## Connecting to MQTT

1. Drag **MQTT In** node
2. Set Server: localhost:1883
3. Set Topic: equipment/telemetry
4. Connect to a debug node

## Connecting to Kafka

1. Install node-red-contrib-kafka
2. Drag **Kafka Producer** node
3. Set Broker: localhost:9092
4. Set Topic: equipment.telemetry

---

