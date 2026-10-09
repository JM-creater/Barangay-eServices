-- ===================================================================
-- Barangay e-Services Database Schema (MySQL)
-- Barangay Cansojong, Talisay City, Cebu
-- Based on WORKFLOW AND SOFTWARE ARCHITECTURE.pdf
-- ===================================================================

CREATE DATABASE IF NOT EXISTS `barangay_eservices` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `barangay_eservices`;

-- 1. Roles table
CREATE TABLE IF NOT EXISTS `roles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `middle_name` VARCHAR(50),
    `last_name` VARCHAR(50) NOT NULL,
    `suffix` VARCHAR(20),
    `contact_number` VARCHAR(20) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `barangay` VARCHAR(100) DEFAULT 'Cansojong',
    `city` VARCHAR(100) DEFAULT 'Talisay City',
    `province` VARCHAR(100) DEFAULT 'Cebu',
    `account_status` VARCHAR(20) DEFAULT 'ACTIVE',
    `auth_provider` VARCHAR(20) DEFAULT 'LOCAL',
    `google_id` VARCHAR(100),
    `profile_picture_url` VARCHAR(500),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. User Roles mapping
CREATE TABLE IF NOT EXISTS `user_roles` (
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`),
    CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Services Catalog table
CREATE TABLE IF NOT EXISTS `services` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `service_code` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `estimated_processing_days` INT DEFAULT 1,
    `instructions` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Service Requirements table
CREATE TABLE IF NOT EXISTS `service_requirements` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `service_id` BIGINT NOT NULL,
    `requirement_name` VARCHAR(150) NOT NULL,
    `description` TEXT,
    `is_mandatory` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_requirement_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Appointment Slots table
CREATE TABLE IF NOT EXISTS `appointment_slots` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `slot_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `max_capacity` INT NOT NULL DEFAULT 10,
    `booked_count` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_slot_date_time` (`slot_date`, `start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Document Requests table
CREATE TABLE IF NOT EXISTS `document_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `reference_number` VARCHAR(50) NOT NULL UNIQUE,
    `resident_id` BIGINT NOT NULL,
    `service_id` BIGINT NOT NULL,
    `purpose` VARCHAR(255) NOT NULL,
    `submitted_data` JSON,
    `assigned_staff_id` BIGINT,
    `current_status` VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    `remarks` TEXT,
    `rejection_reason` TEXT,
    `correction_notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_request_resident` FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_request_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
    CONSTRAINT `fk_request_staff` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Request Files table
CREATE TABLE IF NOT EXISTS `request_files` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `request_id` BIGINT NOT NULL,
    `requirement_id` BIGINT,
    `original_file_name` VARCHAR(255) NOT NULL,
    `stored_file_name` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(100),
    `file_size` BIGINT,
    `storage_path` VARCHAR(255) NOT NULL,
    `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_request_files_request` FOREIGN KEY (`request_id`) REFERENCES `document_requests` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_request_files_requirement` FOREIGN KEY (`requirement_id`) REFERENCES `service_requirements` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Appointments table
CREATE TABLE IF NOT EXISTS `appointments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `request_id` BIGINT NOT NULL UNIQUE,
    `slot_id` BIGINT NOT NULL,
    `resident_id` BIGINT NOT NULL,
    `appointment_date` DATE NOT NULL,
    `appointment_time` TIME NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    `notes` TEXT,
    `cancellation_reason` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_appointment_request` FOREIGN KEY (`request_id`) REFERENCES `document_requests` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_appointment_slot` FOREIGN KEY (`slot_id`) REFERENCES `appointment_slots` (`id`),
    CONSTRAINT `fk_appointment_resident` FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Request Status History table
CREATE TABLE IF NOT EXISTS `request_status_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `request_id` BIGINT NOT NULL,
    `previous_status` VARCHAR(50),
    `new_status` VARCHAR(50) NOT NULL,
    `remarks` TEXT,
    `changed_by_user_id` BIGINT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_history_request` FOREIGN KEY (`request_id`) REFERENCES `document_requests` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_history_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Document Releases table
CREATE TABLE IF NOT EXISTS `document_releases` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `request_id` BIGINT NOT NULL UNIQUE,
    `release_reference_no` VARCHAR(60) NOT NULL UNIQUE,
    `issued_document_number` VARCHAR(60) NOT NULL,
    `recipient_name` VARCHAR(150) NOT NULL,
    `releasing_officer_id` BIGINT NOT NULL,
    `official_approver_id` BIGINT,
    `payment_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `official_receipt_number` VARCHAR(60),
    `payment_status` VARCHAR(50) DEFAULT 'PAID',
    `release_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `remarks` TEXT,
    CONSTRAINT `fk_release_request` FOREIGN KEY (`request_id`) REFERENCES `document_requests` (`id`),
    CONSTRAINT `fk_release_officer` FOREIGN KEY (`releasing_officer_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_release_approver` FOREIGN KEY (`official_approver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `recipient_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `channel` VARCHAR(50) DEFAULT 'IN_APP',
    `is_read` BOOLEAN DEFAULT FALSE,
    `reference_number` VARCHAR(50),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notification_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Audit Logs table
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT,
    `action` VARCHAR(100) NOT NULL,
    `entity_name` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(100),
    `details` TEXT,
    `ip_address` VARCHAR(50),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Holidays table
CREATE TABLE IF NOT EXISTS `holidays` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `holiday_date` DATE NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `type` VARCHAR(50) DEFAULT 'REGULAR',
    `description` VARCHAR(500),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Password Reset Tokens table
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `token` VARCHAR(100) NOT NULL UNIQUE,
    `user_id` BIGINT NOT NULL,
    `expiry_date` DATETIME NOT NULL,
    `is_used` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reset_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================================
-- 16. Performance & High-Efficiency Query Indexes
-- ===================================================================

-- Document Requests Indexes
CREATE INDEX IF NOT EXISTS `idx_doc_req_resident_created` ON `document_requests` (`resident_id`, `created_at` DESC);
CREATE INDEX IF NOT EXISTS `idx_doc_req_status_created` ON `document_requests` (`current_status`, `created_at` DESC);
CREATE INDEX IF NOT EXISTS `idx_doc_req_service_status` ON `document_requests` (`service_id`, `current_status`);
CREATE INDEX IF NOT EXISTS `idx_doc_req_dup_check` ON `document_requests` (`resident_id`, `service_id`, `current_status`);
CREATE INDEX IF NOT EXISTS `idx_doc_req_created` ON `document_requests` (`created_at` DESC);

-- Appointments Indexes
CREATE INDEX IF NOT EXISTS `idx_appts_resident_date` ON `appointments` (`resident_id`, `appointment_date` DESC, `appointment_time` DESC);
CREATE INDEX IF NOT EXISTS `idx_appts_date_status` ON `appointments` (`appointment_date`, `status`);
CREATE INDEX IF NOT EXISTS `idx_appts_status_date_time` ON `appointments` (`status`, `appointment_date` DESC, `appointment_time` ASC);

-- Appointment Slots Indexes
CREATE INDEX IF NOT EXISTS `idx_slots_date_active_time` ON `appointment_slots` (`slot_date`, `is_active`, `start_time`);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS `idx_notif_recipient_created` ON `notifications` (`recipient_id`, `created_at` DESC);
CREATE INDEX IF NOT EXISTS `idx_notif_recipient_unread` ON `notifications` (`recipient_id`, `is_read`);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS `idx_audit_created` ON `audit_logs` (`created_at` DESC);
CREATE INDEX IF NOT EXISTS `idx_audit_entity_created` ON `audit_logs` (`entity_name`, `created_at` DESC);
CREATE INDEX IF NOT EXISTS `idx_audit_action_created` ON `audit_logs` (`action`, `created_at` DESC);

-- Document Releases Indexes
CREATE INDEX IF NOT EXISTS `idx_release_date` ON `document_releases` (`release_date` DESC);
CREATE INDEX IF NOT EXISTS `idx_release_payment_date` ON `document_releases` (`payment_status`, `release_date`);

-- Users Indexes
CREATE INDEX IF NOT EXISTS `idx_users_google_id` ON `users` (`google_id`);
CREATE INDEX IF NOT EXISTS `idx_users_status` ON `users` (`account_status`);

-- Request Status History Indexes
CREATE INDEX IF NOT EXISTS `idx_history_req_created` ON `request_status_history` (`request_id`, `created_at` DESC);


