-- Verify data has been cleared (except users)
SELECT 'readings' as table_name, COUNT(*) as count FROM "readings"
UNION ALL
SELECT 'scheduled_readings', COUNT(*) FROM "scheduled_readings"
UNION ALL
SELECT 'meter_assignments', COUNT(*) FROM "meter_assignments"
UNION ALL
SELECT 'notifications', COUNT(*) FROM "notifications"
UNION ALL
SELECT 'meters', COUNT(*) FROM "meters"
UNION ALL
SELECT 'locations', COUNT(*) FROM "locations"
UNION ALL
SELECT 'meter_types', COUNT(*) FROM "meter_types"
UNION ALL
SELECT 'users', COUNT(*) FROM "users"
ORDER BY table_name;

