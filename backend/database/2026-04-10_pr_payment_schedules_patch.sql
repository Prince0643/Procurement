-- PR Payment Schedule + Reminder Notifications (V1)
-- Safe to run on existing database.

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `purchase_request_payment_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_request_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pr_payment_date` (`purchase_request_id`,`payment_date`),
  KEY `idx_prps_payment_date` (`payment_date`),
  KEY `fk_pr_schedule_created_by` (`created_by`),
  CONSTRAINT `fk_pr_schedule_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pr_schedule_pr` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_schedule_reminder_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` int(11) NOT NULL,
  `reminder_type` varchar(20) NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_schedule_reminder` (`schedule_id`,`reminder_type`),
  KEY `idx_psrl_type_sent_at` (`reminder_type`,`sent_at`),
  CONSTRAINT `fk_reminder_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `purchase_request_payment_schedules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `notifications`
  MODIFY COLUMN `type` varchar(50) DEFAULT 'System';

SET FOREIGN_KEY_CHECKS = 1;
