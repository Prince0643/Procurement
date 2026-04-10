-- Payment schedules for Service Requests, Cash Requests, and Reimbursements
-- Safe to run on existing database.

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `service_request_payment_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_request_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sr_payment_date` (`service_request_id`,`payment_date`),
  KEY `idx_srps_payment_date` (`payment_date`),
  KEY `fk_sr_schedule_created_by` (`created_by`),
  CONSTRAINT `fk_sr_schedule_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sr_schedule_sr` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cash_request_payment_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cash_request_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cr_payment_date` (`cash_request_id`,`payment_date`),
  KEY `idx_crps_payment_date` (`payment_date`),
  KEY `fk_cr_schedule_created_by` (`created_by`),
  CONSTRAINT `fk_cr_schedule_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cr_schedule_cr` FOREIGN KEY (`cash_request_id`) REFERENCES `cash_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reimbursement_payment_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reimbursement_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rmb_payment_date` (`reimbursement_id`,`payment_date`),
  KEY `idx_rps_payment_date` (`payment_date`),
  KEY `fk_rmb_schedule_created_by` (`created_by`),
  CONSTRAINT `fk_rmb_schedule_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rmb_schedule_rmb` FOREIGN KEY (`reimbursement_id`) REFERENCES `reimbursements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `service_schedule_reminder_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` int(11) NOT NULL,
  `reminder_type` varchar(20) NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sr_schedule_reminder` (`schedule_id`,`reminder_type`),
  KEY `idx_ssrl_type_sent_at` (`reminder_type`,`sent_at`),
  CONSTRAINT `fk_ssrl_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `service_request_payment_schedules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cash_schedule_reminder_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` int(11) NOT NULL,
  `reminder_type` varchar(20) NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cr_schedule_reminder` (`schedule_id`,`reminder_type`),
  KEY `idx_csrl_type_sent_at` (`reminder_type`,`sent_at`),
  CONSTRAINT `fk_csrl_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `cash_request_payment_schedules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reimbursement_schedule_reminder_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` int(11) NOT NULL,
  `reminder_type` varchar(20) NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rmb_schedule_reminder` (`schedule_id`,`reminder_type`),
  KEY `idx_rsrl_type_sent_at` (`reminder_type`,`sent_at`),
  CONSTRAINT `fk_rsrl_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `reimbursement_payment_schedules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
