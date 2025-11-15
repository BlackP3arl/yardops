-- Check if there are any meters with invalid meterTypeId
SELECT 
    m.id,
    m."meterNumber",
    m."meterTypeId",
    mt.name as meter_type_name
FROM "meters" m
LEFT JOIN "meter_types" mt ON m."meterTypeId" = mt.id
WHERE m."meterTypeId" IS NULL OR mt.id IS NULL;

-- Check if meter_types table has data
SELECT COUNT(*) as meter_type_count FROM "meter_types";

-- List all meter types
SELECT id, name, description FROM "meter_types";

