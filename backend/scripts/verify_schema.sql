-- Verify the meters table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'meters' 
ORDER BY ordinal_position;

-- Check if foreign key exists
SELECT
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'meters' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'meterTypeId';

-- Test query to see if we can select from meters with joins
SELECT 
    m.id,
    m."meterNumber",
    m."meterTypeId",
    mt.name as meter_type_name,
    l.name as location_name
FROM "meters" m
LEFT JOIN "meter_types" mt ON m."meterTypeId" = mt.id
LEFT JOIN "locations" l ON m."locationId" = l.id
LIMIT 5;

