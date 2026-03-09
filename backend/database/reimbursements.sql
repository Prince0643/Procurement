-- Reimbursements table
CREATE TABLE IF NOT EXISTS `reimbursements` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `rmb_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_by` int(11) unsigned NOT NULL,
  `payee` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `place_of_delivery` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_delivery` date DEFAULT NULL,
  `delivery_term` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_term` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `status` enum('Draft','Pending','For Approval','Approved','Rejected','Paid') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` int(11) unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rmb_number` (`rmb_number`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `fk_reimbursements_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `fk_reimbursements_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reimbursement items table
CREATE TABLE IF NOT EXISTS `reimbursement_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `reimbursement_id` int(11) unsigned NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reimbursement_id` (`reimbursement_id`),
  CONSTRAINT `fk_reimbursement_items_reimbursement` FOREIGN KEY (`reimbursement_id`) REFERENCES `reimbursements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reimbursement attachments table
CREATE TABLE IF NOT EXISTS `reimbursement_attachments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `reimbursement_id` int(11) unsigned NOT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by` int(11) unsigned NOT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reimbursement_id` (`reimbursement_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `fk_reimbursement_attachments_reimbursement` FOREIGN KEY (`reimbursement_id`) REFERENCES `reimbursements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reimbursement_attachments_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
