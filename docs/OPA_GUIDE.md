# OPA Policy Enforcement Guide

## Overview

Open Policy Agent (OPA) is a policy engine that enforces authorization rules for your API endpoints.

## Access OPA

- API: http://localhost:8181
- No web UI - API only

## Policy Location

- Policies are in: opa/policies/
- Main policy: auth.rego

## Testing Policies

### Test Admin Access
curl -X POST http://localhost:8181/v1/data/auth/allow -H "Content-Type: application/json" -d '{"input": {"role": "admin", "method": "GET", "path": "/api/v1/wafers"}}'

Expected: {"result": true}

### Test Employee Access
curl -X POST http://localhost:8181/v1/data/auth/allow -H "Content-Type: application/json" -d '{"input": {"role": "employee", "method": "GET", "path": "/api/v1/wafers"}}'

Expected: {"result": true}

### Test Unauthorized Access
curl -X POST http://localhost:8181/v1/data/auth/allow -H "Content-Type: application/json" -d '{"input": {"role": "employee", "method": "POST", "path": "/api/v1/admin"}}'

Expected: {"result": false}

## Policy Rules

### Admin Access
allow { input.role == "admin" }

### Employee GET Requests
allow { input.role == "employee" input.method == "GET" startswith(input.path, "/api/v1/wafers") }

### Employee POST Batches
allow { input.role == "employee" input.method == "POST" startswith(input.path, "/api/v1/wafers/batches") }

## View All Policies

curl http://localhost:8181/v1/policies

## Troubleshooting

### Connection Refused
- Check OPA is running: sudo docker-compose ps opa
- Check logs: sudo docker-compose logs opa

### Policy Parse Error
- Rego syntax requires `if` keyword for rules
- Example: allow if { input.role == "admin" }

---

