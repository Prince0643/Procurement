-- Drop tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS `reimbursement_attachments`;
DROP TABLE IF EXISTS `reimbursement_items`;
DROP TABLE IF EXISTS `reimbursements`;

-- Reimbursements table
CREATE TABLE `reimbursements` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `rmb_number` varchar(50) NOT NULL,
  `requested_by` int(11) unsigned NOT NULL,
  `payee` varchar(255) NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  `project` varchar(255) DEFAULT NULL,
  `place_of_delivery` varchar(255) DEFAULT NULL,
  `date_of_delivery` date DEFAULT NULL,
  `delivery_term` varchar(100) DEFAULT NULL,
  `payment_term` varchar(100) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `status` enum('Draft','Pending','For Approval','Approved','Rejected','Paid') DEFAULT 'Draft',
  `remarks` text DEFAULT NULL,
  `approved_by` int(11) unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rmb_number` (`rmb_number`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`)
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
  PRIMARY KEY (`id`),
  KEY `reimbursement_id` (`reimbursement_id`)
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
  PRIMARY KEY (`id`),
  KEY `reimbursement_id` (`reimbursement_id`),
  KEY `uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
