-- ===================================================================
-- Barangay e-Services: Database Clean & Truncate Script
-- Barangay Cansojong, Talisay City, Cebu
-- 
-- PURPOSE:
-- Safely empties all user-submitted transactional data, appointment
-- bookings, uploaded document metadata, status logs, audit logs,
-- and notifications WITHOUT deleting or corrupting default system data.
--
-- PRESERVED TABLES (Default & Reference Data - Untouched):
--   - `roles`                (Default roles: ROLE_RESIDENT, ROLE_STAFF, ROLE_APPROVER, ROLE_ADMIN)
--   - `services`             (Catalog: Clearance, Residency, Indigency, Business, Good Moral)
--   - `service_requirements` (Requirement checklist for each service)
--   - `holidays`             (Philippine national and local holidays)
--   - `users` & `user_roles` (Preserved by default; default admin, staff, approver, resident)
--
-- TRUNCATED TABLES (Saved User / Transactional Data):
--   - `document_releases`    (Issued clearances, receipts, release records)
--   - `appointments`         (Booked citizen appointments)
--   - `request_status_history` (Status transition and remarks history)
--   - `request_files`        (Uploaded file metadata)
--   - `document_requests`    (Citizen application requests)
--   - `notifications`        (In-app notifications)
--   - `audit_logs`           (User activity audit trail)
--   - `password_reset_tokens`(Password reset tokens)
--
-- RESET TABLES:
--   - `appointment_slots`    (Resets booked_count = 0 to restore capacity)
-- ===================================================================

USE `barangay_eservices`;

-- Step 1: Temporarily disable foreign key checks to allow truncating referenced tables
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Truncate transactional records & user submissions
TRUNCATE TABLE `document_releases`;
TRUNCATE TABLE `appointments`;
TRUNCATE TABLE `request_status_history`;
TRUNCATE TABLE `request_files`;
TRUNCATE TABLE `document_requests`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `password_reset_tokens`;

-- Step 3: Reset appointment slot capacities (restores booked count back to 0)
UPDATE `appointment_slots` SET `booked_count` = 0;

-- Step 4: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- OPTIONAL: Clean Non-Default / Test Resident Accounts
-- (Uncomment the block below if you also want to remove test registered
-- citizens while keeping pre-seeded accounts: admin, staff, approver, resident)
-- ===================================================================
/*
SET FOREIGN_KEY_CHECKS = 0;

DELETE ur FROM `user_roles` ur
JOIN `users` u ON ur.user_id = u.id
WHERE u.username NOT IN ('admin', 'staff', 'approver', 'resident');

DELETE FROM `users` 
WHERE `username` NOT IN ('admin', 'staff', 'approver', 'resident');

SET FOREIGN_KEY_CHECKS = 1;
*/
