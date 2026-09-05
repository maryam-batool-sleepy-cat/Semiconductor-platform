package auth

# Default deny
default allow := false

# Admin can do everything
allow if {
    input.role == "admin"
}

# Employees can GET wafer data
allow if {
    input.role == "employee"
    input.method == "GET"
    startswith(input.path, "/api/v1/wafers")
}

# Employees can GET equipment data
allow if {
    input.role == "employee"
    input.method == "GET"
    startswith(input.path, "/api/v1/equipment")
}

# Employees can POST batches
allow if {
    input.role == "employee"
    input.method == "POST"
    startswith(input.path, "/api/v1/wafers/batches")
}

# Employees can GET maintenance predictions
allow if {
    input.role == "employee"
    input.method == "GET"
    startswith(input.path, "/api/v1/maintenance/predictions")
}

# Employees can GET yield analytics
allow if {
    input.role == "employee"
    input.method == "GET"
    startswith(input.path, "/api/v1/yield")
}
