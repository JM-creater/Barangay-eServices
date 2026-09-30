-- Seed Initial Roles
INSERT INTO `roles` (`name`) VALUES 
('ROLE_RESIDENT'),
('ROLE_STAFF'),
('ROLE_APPROVER'),
('ROLE_ADMIN')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Seed Services
INSERT INTO `services` (`service_code`, `name`, `description`, `fee`, `estimated_processing_days`, `instructions`, `is_active`) VALUES
('BC-CLEARANCE', 'Barangay Clearance', 'General clearance issued for employment, police clearance application, local travel, scholarship, or general identification purposes.', 50.00, 1, 'Please bring 1 valid government ID and 1 piece 2x2 or 1x1 recent photo during your office visit.', TRUE),
('BC-INDIGENCY', 'Certificate of Indigency', 'Official certification for residents belonging to indigent or low-income families, typically required for medical assistance (Malasakit/DSWD), burial assistance, legal aid (PAO), or school scholarships.', 0.00, 1, 'Free of charge. Please present proof of low income or referral from barangay health/social worker.', TRUE),
('BC-RESIDENCY', 'Certificate of Residency', 'Proof of bona fide residence within Barangay Cansojong, Talisay City, Cebu. Commonly required for bank accounts, passport application, DFA, utility meters, and school enrollment.', 50.00, 1, 'Please bring proof of billing address (water, electric bill, or lease contract) and 1 valid ID.', TRUE),
('BC-BUSINESS', 'Barangay Business Clearance', 'Mandatory barangay permit/clearance required prior to applying for or renewing a Talisay City Mayor’s Business Permit.', 200.00, 2, 'Attach DTI or SEC Registration, previous year business permit (if renewal), and contract of lease / proof of ownership.', TRUE),
('BC-GOODMORAL', 'Certificate of Good Moral Character', 'Attests that the resident is of good moral standing and has no derogatory record or pending cases in the Lupong Tagapamayapa.', 50.00, 1, 'Must have no pending dispute in Barangay Cansojong Lupong Tagapamayapa.', TRUE)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Seed Service Requirements
-- 1. Barangay Clearance Requirements
INSERT INTO `service_requirements` (`service_id`, `requirement_name`, `description`, `is_mandatory`)
SELECT s.id, 'Valid Government ID', 'Photocopy or scanned copy of SSS, PhilHealth, Driver License, Passport, or Voter ID', TRUE
FROM `services` s WHERE s.service_code = 'BC-CLEARANCE';

INSERT INTO `service_requirements` (`service_id`, `requirement_name`, `description`, `is_mandatory`)
SELECT s.id, 'Recent 2x2 or 1x1 Photo', 'Recent colored photo with white background', TRUE
FROM `services` s WHERE s.service_code = 'BC-CLEARANCE';

-- 2. Certificate of Indigency Requirements
INSERT INTO `service_requirements` (`service_id`, `requirement_name`, `description`, `is_mandatory`)
SELECT s.id, 'Valid Government ID or Student ID', 'Valid ID of the applicant or student', TRUE
FROM `services` s WHERE s.service_code = 'BC-INDIGENCY';

INSERT INTO `service_requirements` (`service_id`, `requirement_name`, `description`, `is_mandatory`)
SELECT s.id, 'Hospital Clinical Summary / Prescription / Funeral Contract', 'Supporting document for financial/medical/burial assistance', FALSE
FROM `services` s WHERE s.service_code = 'BC-INDIGENCY';

-- 3. Certificate of Residency Requirements
INSERT INTO `service_requirements` (`service_id`, `requirement_name`, `description`, `is_mandatory`)
SELECT s.id, 'Proof of Residence / Billing Statement', 'Water/Electricity bill or Barangay Purok Certificate indicating Cansojong address', TRUE
FROM `services` s WHERE s.service_code = 'BC-RESIDENCY';

INSERT INTO `service_requirements` (`service_id`, `requirement_name`, `description`, `is_mandatory`)
SELECT s.id, 'Valid ID', 'Valid government-issued ID showing full name', TRUE
FROM `services` s WHERE s.service_code = 'BC-RESIDENCY';

-- 4. Barangay Business Clearance Requirements
INSERT INTO `service_requirements` (`service_id`, `requirement_name`, `description`, `is_mandatory`)
SELECT s.id, 'DTI / SEC / CDA Registration', 'Certificate of Business Name Registration', TRUE
FROM `services` s WHERE s.service_code = 'BC-BUSINESS';

INSERT INTO `service_requirements` (`service_id`, `requirement_name`, `description`, `is_mandatory`)
SELECT s.id, 'Contract of Lease or Tax Declaration', 'Proof of business location in Barangay Cansojong', TRUE
FROM `services` s WHERE s.service_code = 'BC-BUSINESS';

-- 5. Good Moral Character Requirements
INSERT INTO `service_requirements` (`service_id`, `requirement_name`, `description`, `is_mandatory`)
SELECT s.id, 'Valid Government ID', 'Official ID of resident', TRUE
FROM `services` s WHERE s.service_code = 'BC-GOODMORAL';
