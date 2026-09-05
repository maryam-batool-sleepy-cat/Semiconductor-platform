package validation

# Validate equipment data
validate_equipment(equipment) if {
    count(equipment.equipment_id) > 0
    count(equipment.name) > 0
    equipment.type in ["lithography", "etching", "deposition", "inspection"]
}

# Validate batch data
validate_batch(batch) if {
    count(batch.batch_name) > 0
    batch.total_wafers >= 20
    batch.total_wafers <= 30
}
