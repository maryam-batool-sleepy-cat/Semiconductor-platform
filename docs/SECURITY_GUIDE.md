# Security Architecture Guide

## Overview

The platform implements defense-in-depth security controls including identity management, network segmentation, and secure communication.

LINKS FOR KEY LOCK: 

keylock for employee : http://localhost:8081/realms/semiconductor/account/#/

keylock for admin : http://localhost:8081/realms/master/protocol/openid-connect/auth?client_id=security-admin-console&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Fadmin%2Fmaster%2Fconsole%2F&state=8fbc1a66-a310-4c2e-a0e6-e1c99776fc53&response_mode=fragment&response_type=code&scope=openid&nonce=667a56f4-8314-4863-a8cb-12e65222c27b&code_challenge=i-3ZiZ3ac5NfU4rOqA8XQOFs1RDQSXFXQpzS9EgSQoE&code_challenge_method=S256

Passwords : 
Employee : testuser/test123

Admin : admin/admin

## Authentication and Authorization

### Keycloak Integration

Keycloak provides centralized identity management with:
- Single Sign-On (SSO)
- Role-based access control
- User lifecycle management
- Password policies

### User Roles

Admin Role:
- Full system access
- User management
- Configuration access
- Report generation

Employee Role:
- View dashboards
- Schedule maintenance
- View predictions
- Basic operations

### JWT Authentication

All API requests are authenticated using JWT tokens:
- Tokens issued by Keycloak
- Expire after 30 minutes
- Include user roles and permissions

## Network Security (Kubernetes)

### Network Policies

The platform uses network policies to enforce segmentation:
- API can only talk to PostgreSQL and Redis
- Frontend can only talk to API
- Simulator can only talk to API
- No external access to databases

### Service Isolation

Services are isolated using:
- Namespace separation
- Network policies
- Service accounts with minimal permissions

## Data Security

### Database Security
- PostgreSQL requires authentication
- Connections are encrypted
- Least privilege principle applied

### Sensitive Data
- Secrets stored in Kubernetes secrets
- Environment variables for configuration
- No hardcoded credentials

## Security Controls (Standards)

### IEC 62443 Compliance
- Authentication controls
- Access control mechanisms
- Audit logging
- Security monitoring

### NIST CSF 2.0
- Asset identification
- Access control
- Awareness and training
- Data security
- Incident response

### ISO/IEC 27001
- Information security policies
- Access control
- Asset management
- Incident management

## Monitoring and Auditing

### Prometheus Alerts
- API health monitoring
- Resource usage
- Security events

### Grafana Dashboards
- Security dashboards
- Audit logs
- Access patterns

## Incident Response

### Alerting
- Critical failures trigger alerts
- Unauthorized access attempts
- System health degradation

### Escalation
- High priority alerts go to admins
- Medium priority alerts to operations
- Low priority alerts logged

## Security Recommendations

### Production Deployment
- Enable HTTPS
- Use strong passwords
- Regular security updates
- Monitor access logs
- Implement backup and recovery
- Regular penetration testing

### Network Hardening
- Enable firewall rules
- Use VPN for remote access
- Network segmentation
- Regular vulnerability scanning


