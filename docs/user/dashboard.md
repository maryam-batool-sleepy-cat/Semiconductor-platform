# User Guide - Semiconductor Manufacturing Platform

## Overview

The Semiconductor Manufacturing Operations Platform provides real-time monitoring of wafer production, equipment health, yield analytics, and maintenance operations.

## Getting Started

### Access the Platform
1. Open http://localhost:5173
2. Click "Employee Login" or "Admin Login"
3. Enter your credentials

### Credentials
Employee: employee / employee123

Admin: admin / admin123

## Dashboard

### Main Dashboard Sections
1. Summary Section: Overview of all operations
2. KPI Cards: Key metrics at a glance
3. Section Cards: Click to access detailed views

### Navigation
- Dashboard: Main summary view
- Wafer Production: Manage wafer batches
- Equipment Health: Monitor all equipment
- Yield Analytics: View quality metrics
- Maintenance: Manage maintenance
- Wafer Lifecycle: Track wafer progress

## Wafer Production

### Create a Batch
1. Go to Wafer Production
2. Click "New Batch"
3. Fill in:
   - Batch Name (e.g., BATCH-2024-001)
   - Product Type (AI-Accelerator, Automotive, etc.)
   - Total Wafers (20-30)
4. Click "Create"

### Track Wafer Progress
1. Click "View History" on any batch
2. See each wafer's current stage
3. Click stage buttons to advance wafers:
   - Registered → Lithography → Etching → Deposition → Inspection → Completed

### Auto-Advance Features
- Auto-Advance One Stage: Moves all wafers in a batch to the next stage
- Auto-Complete All: Completes all wafers in a batch instantly

## Equipment Health

### View Equipment Status
1. Go to Equipment Health
2. See all equipment with:
   - Type (Lithography, Etching, Deposition, Inspection)
   - Status (Operational, Maintenance, Degraded)
   - Operating Hours
   - Uptime %

### Check Equipment Details
1. Click "View Details" on any equipment
2. View health metrics:
   - Temperature
   - Vibration
   - Health Score
   - Alerts

## Yield Analytics

### View Yield Metrics
1. Go to Yield Analytics
2. See:
   - Overall Yield (%)
   - Average Defects
   - Quality Score
   - Batch Performance
   - Process Variation

## Maintenance

### View Predictions
1. Go to Maintenance
2. See predicted maintenance schedules
3. View health scores and failure probabilities
4. Priority levels (Urgent/High/Medium/Low)

### Schedule Maintenance
1. Click "Schedule Maintenance"
2. Fill in:
   - Equipment ID
   - Maintenance Type
   - Scheduled Date
   - Description
   - Technician
   - Cost
3. Click "Schedule"

### Complete Maintenance
1. In the Maintenance History section
2. Click "Complete" on any scheduled maintenance

## Admin Dashboard (Admin Only)

### Access Admin Features
1. Login as admin
2. Go to Admin Dashboard
3. View:
   - Executive KPIs
   - Manufacturing Performance
   - Active Batches
   - Defect Statistics

## Data Simulator

The data simulator runs continuously and:
- Creates new wafer batches automatically
- Moves wafers through production stages
- Generates yield and defect data
- Simulates equipment telemetry
- Automatically refreshes authentication tokens

## Tips

1. Refresh: Click refresh icons for latest data
2. Navigation: Use top menu to switch sections
3. Data Updates: Data refreshes every 30 seconds
4. Session: Auto-logout after 30 minutes of inactivity
