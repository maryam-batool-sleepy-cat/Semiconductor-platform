# Monitoring Stack Guide

## Overview

The platform includes a complete monitoring stack for metrics, logs, and traces.

## Components

| Service | Port | Purpose |
|---------|------|---------|
| Prometheus | 9090 | Metrics collection |
| Grafana | 3000 | Dashboards |
| Loki | 3100 | Log aggregation |
| Promtail | 9080 | Log collection |
| OpenTelemetry | - | Distributed tracing |

## Access

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | - |
| Loki | http://localhost:3100 | - |
| Promtail | http://localhost:9080 | - |

## Prometheus Metrics

### Available Metrics
- http_requests_total: API request count
- http_request_duration_seconds: Request duration
- up: Service health status
- equipment_health_score: Equipment health

### Example Queries

#### API Request Rate
rate(http_requests_total[5m])

#### All Services Status
up

#### API Error Rate
rate(http_requests_total{status=~"5.."}[5m])

## Grafana Dashboards

### Pre-built Dashboards

- Semiconductor API Metrics: API performance
- Equipment Health: Equipment status
- Maintenance KPIs: Maintenance metrics
- Loki Logs: Log visualization

### Creating a Dashboard
1. Click + → Create Dashboard
2. Add visualization
3. Select Prometheus data source
4. Write a query
5. Click Apply

## Loki Log Queries

### All API Logs
{container="semiconductor-api"}

### Error Logs
{container="semiconductor-api"} |= "error"

### Log Volume
count_over_time({container="semiconductor-api"}[5m])

## Promtail Log Collection

Promtail collects logs from:
- All Docker containers
- Adds labels: container, service, stream

## OpenTelemetry Tracing

OpenTelemetry is configured but not actively used. To enable:

1. Install dependencies: pip install opentelemetry-api opentelemetry-sdk
2. Configure exporter endpoint
3. Enable in main.py

## Troubleshooting

### Prometheus No Data
- Check targets: http://localhost:9090/targets
- Verify API is exposing /metrics

### Grafana Connection Failed
- Check data source URL: http://prometheus:9090 or http://loki:3100

### Loki No Logs
- Check Promtail is running
- Check Loki ingester status: curl http://localhost:3100/ready

---

