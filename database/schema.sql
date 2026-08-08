-- PostgreSQL Schema for Semiconductor Manufacturing Platform

-- Equipment Table
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    equipment_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    model VARCHAR(50),
    manufacturer VARCHAR(50),
    installation_date TIMESTAMP,
    operating_hours FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'operational',
    temperature FLOAT,
    vibration FLOAT,
    power_consumption FLOAT,
    last_maintenance_date TIMESTAMP,
    next_maintenance_date TIMESTAMP,
    uptime_hours FLOAT DEFAULT 0,
    downtime_hours FLOAT DEFAULT 0,
    scheduled_downtime_hours FLOAT DEFAULT 0,
    unscheduled_downtime_hours FLOAT DEFAULT 0,
    productive_time_hours FLOAT DEFAULT 0,
    standby_time_hours FLOAT DEFAULT 0,
    engineering_time_hours FLOAT DEFAULT 0,
    total_time_hours FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wafer Batches Table
CREATE TABLE wafer_batches (
    id SERIAL PRIMARY KEY,
    batch_name VARCHAR(50) UNIQUE NOT NULL,
    product_type VARCHAR(50),
    total_wafers INTEGER DEFAULT 25,
    status VARCHAR(20) DEFAULT 'registered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wafers Table
CREATE TABLE wafers (
    id SERIAL PRIMARY KEY,
    wafer_id VARCHAR(20) UNIQUE NOT NULL,
    batch_id INTEGER REFERENCES wafer_batches(id),
    current_stage VARCHAR(20) DEFAULT 'registered',
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Yield Data Table
CREATE TABLE yield_data (
    id SERIAL PRIMARY KEY,
    wafer_id INTEGER REFERENCES wafers(id),
    process_stage VARCHAR(50),
    defect_count INTEGER DEFAULT 0,
    yield_percentage FLOAT,
    quality_score FLOAT,
    inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters TEXT
);

-- Maintenance Table
CREATE TABLE maintenance (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id),
    maintenance_type VARCHAR(50),
    scheduled_date TIMESTAMP,
    completed_date TIMESTAMP,
    technician VARCHAR(100),
    description TEXT,
    cost FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled'
);

-- Daily Tasks Table
CREATE TABLE daily_tasks (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    batch_id INTEGER REFERENCES wafer_batches(id),
    equipment_id INTEGER REFERENCES equipment(id)
);

-- Goal Tracker Table
CREATE TABLE goal_trackers (
    id SERIAL PRIMARY KEY,
    goal_name VARCHAR(200) NOT NULL,
    description TEXT,
    target_value FLOAT,
    current_value FLOAT DEFAULT 0,
    unit VARCHAR(20),
    deadline TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Items Table
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    min_threshold INTEGER DEFAULT 10,
    max_threshold INTEGER DEFAULT 100,
    location VARCHAR(100),
    supplier VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Defect Reports Table
CREATE TABLE defect_reports (
    id SERIAL PRIMARY KEY,
    wafer_id INTEGER REFERENCES wafers(id),
    defect_type VARCHAR(50),
    severity VARCHAR(20),
    description TEXT,
    found_at_stage VARCHAR(50),
    reported_by VARCHAR(100),
    status VARCHAR(20) DEFAULT 'open',
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
