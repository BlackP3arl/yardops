-- Clear all data from tables except users
-- Order matters due to foreign key constraints

-- Delete in reverse order of dependencies to avoid foreign key constraint violations

-- 1. Delete from tables that reference meters and users
DELETE FROM "readings";
DELETE FROM "scheduled_readings";
DELETE FROM "meter_assignments";
DELETE FROM "notifications";

-- 2. Delete from meters first (before meter_types due to RESTRICT constraint)
-- We need to temporarily remove the foreign key constraint or delete meters first
DELETE FROM "meters";

-- 3. Delete from locations (no dependencies after meters are deleted)
DELETE FROM "locations";

-- 4. Delete from meter_types (RESTRICT constraint requires meters to be deleted first)
DELETE FROM "meter_types";

-- Users table is NOT deleted - all user data remains intact

