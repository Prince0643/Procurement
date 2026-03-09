-- Drop and recreate reimbursements table with correct columns
DROP TABLE IF EXISTS `reimbursement_attachments`;
DROP TABLE IF EXISTS `reimbursement_items`;
DROP TABLE IF EXISTS `reimbursements`;

-- Reimbursements table (matches backend expectations)
CREATE TABLE `reimbursements` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `rmb_number` varchar(50) NOT NULL,
  `requested_by` int(11) unsigned NOT NULL,
  `payee` varchar(255) NOT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `project` varchar(255) DEFAULT NULL,
  `project_address` varchar(500) DEFAULT NULL,
  `order_number` varchar(100) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT 0.00,
  `date_needed` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Draft',
  `approved_by` int(11) unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reimbursement items table
CREATE TABLE `reimbursement_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `reimbursement_id` int(11) unsigned NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reimbursement attachments table
CREATE TABLE `reimbursement_attachments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `reimbursement_id` int(11) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) unsigned DEFAULT 0,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` int(11) unsigned NOT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
