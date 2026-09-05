# Loki Log Aggregation Guide

## Overview

Loki is a log aggregation system that collects and stores logs from all your containers. It works with Promtail to collect logs and Grafana to visualize them.

## Access Loki

Loki is an API-only service. It doesn't have a web UI.

- API Endpoint: http://localhost:3100
- Ready Check: http://localhost:3100/ready

## Query Logs

### Query API Container Logs
curl -G "http://localhost:3100/loki/api/v1/query" --data-urlencode 'query={container="semiconductor-api"}' --data-urlencode 'limit=10'

### Query All Semiconductor Containers
curl -G "http://localhost:3100/loki/api/v1/query" --data-urlencode 'query={container=~"semiconductor-.*"}' --data-urlencode 'limit=10'

### Query Error Logs
curl -G "http://localhost:3100/loki/api/v1/query" --data-urlencode 'query={container="semiconductor-api"} |= "error"' --data-urlencode 'limit=10'

## Add Loki to Grafana

1. Open Grafana: http://localhost:3000
2. Login: admin / admin
3. Go to Configuration → Data Sources → Add data source
4. Select Loki
5. URL: http://loki:3100
6. Click Save & Test

## Grafana Queries

### All API Logs
{container="semiconductor-api"}

### API Error Logs
{container="semiconductor-api"} |= "error"

### All Container Logs
{container=~"semiconductor-.*"}

### Log Volume Over Time
count_over_time({container="semiconductor-api"}[5m])

## Troubleshooting

### 404 Error
Loki is API-only. 404 is normal for the root path.

### Ingester Not Ready
Wait 1-2 minutes for Loki to fully start.

### No Logs in Grafana
Check time range is set to Last 5 minutes or broader.

---

