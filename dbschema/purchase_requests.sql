CREATE TABLE `purchase_requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `pr_number` VARCHAR(50) NOT NULL,
  `requested_by` INT, -- Engineer (nullable to avoid FK issues when employee not in procurement_db)
  `purpose` TEXT,
  `remarks` TEXT,
  `date_needed` DATE NULL,
  `project` VARCHAR(100) NULL,
  `project_address` VARCHAR(255) NULL,
  `supplier_id` INT NULL,
  `supplier_address` VARCHAR(255) NULL,
  `status` ENUM('Pending', 'For Procurement Review', 'For Super Admin Final Approval', 'For Purchase', 'PO Created', 'Completed', 'Rejected', 'Cancelled') DEFAULT 'Pending',
  `approved_by` INT, -- Super Admin
  `approved_at` TIMESTAMP NULL,
  `rejection_reason` TEXT,
  `total_amount` DECIMAL(12,2) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pr_number` (`pr_number`),
  FOREIGN KEY (`requested_by`) REFERENCES `employees`(`id`),
  FOREIGN KEY (`approved_by`) REFERENCES `employees`(`id`),
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`)
);