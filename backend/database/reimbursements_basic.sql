-- Simple version - no indexes, no constraints
CREATE TABLE IF NOT EXISTS `reimbursements` (
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
