-- Adminer 5.4.2 MariaDB 10.4.34-MariaDB-1:10.4.34+maria~ubu2004 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `cash_requests`;
CREATE TABLE `cash_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cr_number` varchar(50) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `quantity` decimal(10,2) DEFAULT 1.00,
  `unit` varchar(50) DEFAULT 'pcs',
  `project` varchar(255) DEFAULT NULL,
  `project_address` text DEFAULT NULL,
  `date_needed` date DEFAULT NULL,
  `order_number` varchar(100) DEFAULT NULL,
  `payment_terms_note` text DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `supplier_address` text DEFAULT NULL,
  `cr_type` varchar(50) DEFAULT 'payment_request',
  `status` enum('Draft','Pending','For Admin Approval','For Super Admin Final Approval','Approved','Cash Request Created','On Hold','Rejected','Received') DEFAULT 'Draft',
  `remarks` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cr_number` (`cr_number`),
  KEY `supplier_id` (`supplier_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_cr_status` (`status`),
  KEY `idx_cr_requested_by` (`requested_by`),
  CONSTRAINT `cash_requests_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `cash_requests_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `cash_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `disbursement_vouchers`;
CREATE TABLE `disbursement_vouchers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dv_number` varchar(50) NOT NULL COMMENT 'Format: YYYY-MM-001 (incremental starting from 001)',
  `purchase_order_id` int(11) DEFAULT NULL,
  `purchase_request_id` int(11) DEFAULT NULL,
  `service_request_id` int(11) DEFAULT NULL,
  `cash_request_id` int(11) DEFAULT NULL,
  `payment_request_id` int(11) DEFAULT NULL,
  `payment_order_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `prepared_by` int(11) NOT NULL COMMENT 'Employee who created the DV',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Total amount from PO',
  `dv_date` date NOT NULL COMMENT 'Date when DV was created',
  `particulars` text DEFAULT NULL COMMENT 'Payment particulars/description',
  `project` varchar(100) DEFAULT NULL,
  `pr_number` varchar(50) DEFAULT NULL COMMENT 'Reference to PR number',
  `sr_number` varchar(50) DEFAULT NULL,
  `cr_number` varchar(50) DEFAULT NULL,
  `po_number` varchar(50) DEFAULT NULL,
  `check_number` varchar(50) DEFAULT NULL COMMENT 'Check number when payment is processed',
  `bank_name` varchar(100) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `received_by` varchar(255) DEFAULT NULL COMMENT 'Person who received payment',
  `received_date` date DEFAULT NULL,
  `status` enum('Draft','Pending','Approved','Paid','Cancelled') DEFAULT 'Draft',
  `certified_by_accounting` int(11) DEFAULT NULL COMMENT 'Employee who certified availability of funds',
  `certified_by_manager` int(11) DEFAULT NULL COMMENT 'General Manager who approved the DV',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `order_number` varchar(10) DEFAULT NULL,
  `dv_type` enum('po_based','sr_based','cash_based') DEFAULT 'po_based' COMMENT 'Source of DV: PO, Service Request, or Cash Request',
  PRIMARY KEY (`id`),
  UNIQUE KEY `dv_number` (`dv_number`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `prepared_by` (`prepared_by`),
  KEY `certified_by_accounting` (`certified_by_accounting`),
  KEY `certified_by_manager` (`certified_by_manager`),
  KEY `service_request_id` (`service_request_id`),
  KEY `dv_type` (`dv_type`),
  KEY `cash_request_id` (`cash_request_id`),
  KEY `idx_payment_request_id` (`payment_request_id`),
  KEY `fk_dv_payment_order` (`payment_order_id`),
  CONSTRAINT `disbursement_vouchers_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `disbursement_vouchers_ibfk_2` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `disbursement_vouchers_ibfk_3` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `disbursement_vouchers_ibfk_4` FOREIGN KEY (`prepared_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `disbursement_vouchers_ibfk_5` FOREIGN KEY (`certified_by_accounting`) REFERENCES `employees` (`id`),
  CONSTRAINT `disbursement_vouchers_ibfk_6` FOREIGN KEY (`certified_by_manager`) REFERENCES `employees` (`id`),
  CONSTRAINT `disbursement_vouchers_ibfk_7` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `disbursement_vouchers_ibfk_8` FOREIGN KEY (`cash_request_id`) REFERENCES `cash_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dv_payment_order` FOREIGN KEY (`payment_order_id`) REFERENCES `payment_orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_no` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_initial` varchar(2) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `role` enum('engineer','procurement','admin','super_admin') DEFAULT 'engineer',
  `department` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_no` (`employee_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_code` varchar(50) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `unit` varchar(50) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_code` (`item_code`),
  UNIQUE KEY `item_name` (`item_name`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `items_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('PR Created','PR Approved','PR Rejected','PO Created','Item Received','System') DEFAULT 'System',
  `related_id` int(11) DEFAULT NULL COMMENT 'ID of related record (PR, PO, etc.)',
  `related_type` varchar(50) DEFAULT NULL COMMENT 'Type of related record',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `recipient_id` (`recipient_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `order_number_budgets`;
CREATE TABLE `order_number_budgets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(100) NOT NULL,
  `project` varchar(200) DEFAULT NULL,
  `planned_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_order_project` (`order_number`,`project`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `payment_orders`;
CREATE TABLE `payment_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) NOT NULL,
  `service_request_id` int(11) DEFAULT NULL,
  `cash_request_id` int(11) DEFAULT NULL,
  `payee_name` varchar(255) NOT NULL,
  `payee_address` text DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `project` varchar(255) DEFAULT NULL,
  `project_address` text DEFAULT NULL,
  `order_number` varchar(100) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('Draft','Pending','For Admin Approval','For Super Admin Final Approval','Approved','PO Created','On Hold','Rejected') DEFAULT 'Draft',
  `remarks` text DEFAULT NULL,
  `requested_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_number` (`po_number`),
  KEY `requested_by` (`requested_by`),
  KEY `idx_po_status` (`status`),
  KEY `idx_po_service_request_id` (`service_request_id`),
  KEY `fk_po_cash_request` (`cash_request_id`),
  CONSTRAINT `fk_po_cash_request` FOREIGN KEY (`cash_request_id`) REFERENCES `cash_requests` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payment_orders_ibfk_1` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payment_orders_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `payment_requests`;
CREATE TABLE `payment_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pr_number` varchar(50) NOT NULL COMMENT 'Reference to original PR number',
  `purchase_request_id` int(11) DEFAULT NULL,
  `service_request_id` int(11) DEFAULT NULL,
  `payee_name` varchar(255) NOT NULL COMMENT 'Person/entity to pay',
  `payee_address` varchar(255) DEFAULT NULL,
  `purpose` text NOT NULL,
  `project` varchar(100) DEFAULT NULL,
  `project_address` varchar(255) DEFAULT NULL,
  `order_number` varchar(10) DEFAULT NULL,
  `payment_terms_note` text DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_basis` enum('debt','non_debt') NOT NULL DEFAULT 'non_debt',
  `requested_by` int(11) NOT NULL,
  `status` enum('Draft','Pending','On Hold','Approved','Rejected','Cancelled','DV Created','Paid') DEFAULT 'Draft',
  `remarks` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `dv_id` int(11) DEFAULT NULL COMMENT 'Reference to Disbursement Voucher when created',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `pr_number` (`pr_number`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  KEY `status` (`status`),
  KEY `dv_id` (`dv_id`),
  KEY `idx_service_request_id` (`service_request_id`),
  CONSTRAINT `fk_payment_requests_service_request_id` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payment_requests_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `payment_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `payment_requests_ibfk_4` FOREIGN KEY (`dv_id`) REFERENCES `disbursement_vouchers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `payment_request_items`;
CREATE TABLE `payment_request_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payment_request_id` int(11) NOT NULL,
  `pr_item_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(20) NOT NULL DEFAULT 'pcs',
  `description` varchar(255) DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `payment_request_id` (`payment_request_id`),
  KEY `pr_item_id` (`pr_item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `payment_request_items_ibfk_1` FOREIGN KEY (`payment_request_id`) REFERENCES `payment_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_request_items_ibfk_2` FOREIGN KEY (`pr_item_id`) REFERENCES `purchase_request_items` (`id`),
  CONSTRAINT `payment_request_items_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `po_attachments`;
CREATE TABLE `po_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL COMMENT 'Relative path to file storage',
  `file_name` varchar(255) NOT NULL COMMENT 'Original file name',
  `file_size` int(11) DEFAULT NULL COMMENT 'File size in bytes',
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `po_attachments_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `po_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `pricing_history`;
CREATE TABLE `pricing_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `purchase_order_id` int(11) DEFAULT NULL,
  `purchase_request_id` int(11) DEFAULT NULL,
  `po_number` varchar(50) DEFAULT NULL,
  `pr_number` varchar(50) DEFAULT NULL,
  `date_recorded` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_pricing_pr` (`purchase_request_id`),
  KEY `fk_pricing_created_by` (`created_by`),
  KEY `idx_pricing_item_id` (`item_id`),
  KEY `idx_pricing_supplier_id` (`supplier_id`),
  KEY `idx_pricing_date` (`date_recorded`),
  KEY `idx_pricing_po` (`purchase_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `pr_item_rejection_remarks`;
CREATE TABLE `pr_item_rejection_remarks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_request_id` int(11) NOT NULL,
  `purchase_request_item_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `remark` text NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `purchase_request_item_id` (`purchase_request_item_id`),
  KEY `item_id` (`item_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `pr_item_rejection_remarks_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pr_item_rejection_remarks_ibfk_2` FOREIGN KEY (`purchase_request_item_id`) REFERENCES `purchase_request_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pr_item_rejection_remarks_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `pr_item_rejection_remarks_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) NOT NULL,
  `purchase_request_id` int(11) DEFAULT NULL,
  `service_request_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `prepared_by` int(11) NOT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `po_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `status` enum('Draft','Pending Approval','Approved','On Hold','Delivered','Paid','Cancelled') DEFAULT 'Draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `place_of_delivery` varchar(255) DEFAULT NULL,
  `delivery_term` varchar(50) DEFAULT 'COD',
  `payment_term` varchar(50) DEFAULT 'CASH',
  `project` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `order_number` varchar(10) DEFAULT NULL,
  `po_type` enum('purchase_order','payment_order') DEFAULT 'purchase_order' COMMENT 'Type of PO: purchase_order (debt) or payment_order (non-debt/prepaid)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_number` (`po_number`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `prepared_by` (`prepared_by`),
  KEY `po_type` (`po_type`),
  KEY `service_request_id` (`service_request_id`),
  KEY `idx_po_type` (`po_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `purchase_order_items`;
CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int(11) NOT NULL,
  `purchase_request_item_id` int(11) DEFAULT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `purchase_request_item_id` (`purchase_request_item_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DELIMITER ;;

CREATE TRIGGER `trg_record_pricing_history_after_po_item_insert` AFTER INSERT ON `purchase_order_items` FOR EACH ROW
BEGIN
  DECLARE v_po_id INT;
  DECLARE v_po_number VARCHAR(50);
  DECLARE v_pr_id INT;
  DECLARE v_pr_number VARCHAR(50);
  DECLARE v_supplier_id INT;
  DECLARE v_po_date DATE;
  
  
  SELECT 
    po.id,
    po.po_number,
    po.purchase_request_id,
    po.supplier_id,
    po.created_at
  INTO 
    v_po_id,
    v_po_number,
    v_pr_id,
    v_supplier_id,
    v_po_date
  FROM purchase_orders po
  WHERE po.id = NEW.purchase_order_id;
  
  
  IF v_pr_id IS NOT NULL THEN
    SELECT pr.pr_number INTO v_pr_number
    FROM purchase_requests pr
    WHERE pr.id = v_pr_id;
  END IF;
  
  
  INSERT INTO pricing_history (
    item_id,
    supplier_id,
    unit_price,
    quantity,
    total_amount,
    purchase_order_id,
    purchase_request_id,
    po_number,
    pr_number,
    date_recorded,
    notes,
    created_by
  ) VALUES (
    NEW.item_id,
    v_supplier_id,
    NEW.unit_price,
    NEW.quantity,
    NEW.quantity * NEW.unit_price,
    v_po_id,
    v_pr_id,
    v_po_number,
    v_pr_number,
    DATE(v_po_date),
    CONCAT('Auto-recorded from PO ', v_po_number),
    NULL
  );
END;;

DELIMITER ;

DROP TABLE IF EXISTS `purchase_requests`;
CREATE TABLE `purchase_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pr_number` varchar(50) NOT NULL,
  `requested_by` int(11) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_needed` date DEFAULT NULL,
  `project` varchar(100) DEFAULT NULL,
  `project_address` varchar(255) DEFAULT NULL,
  `status` enum('Draft','Pending','For Procurement Review','For Super Admin Final Approval','On Hold','For Purchase','PO Created','Payment Request Created','Completed','Rejected','Cancelled','Received') DEFAULT 'Draft',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `supplier_id` int(11) DEFAULT NULL,
  `supplier_address` varchar(255) DEFAULT NULL,
  `order_number` varchar(10) DEFAULT NULL,
  `payment_basis` enum('debt','non_debt') DEFAULT 'debt' COMMENT 'Determines if PR leads to Purchase Order (debt) or Payment Order (non_debt)',
  `payment_terms_code` enum('CASH','COD','NET_7','NET_15','NET_30','CUSTOM') DEFAULT NULL,
  `payment_terms_note` varchar(255) DEFAULT NULL,
  `payment_terms_set_by` int(11) DEFAULT NULL,
  `payment_terms_set_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pr_number` (`pr_number`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  KEY `supplier_id` (`supplier_id`),
  KEY `payment_basis` (`payment_basis`),
  KEY `payment_terms_set_by` (`payment_terms_set_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `purchase_request_items`;
CREATE TABLE `purchase_request_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_request_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `total_price` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` enum('Pending','For Purchase','Purchased','Received') DEFAULT 'Pending',
  `received_by` int(11) DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `item_id` (`item_id`),
  KEY `received_by` (`received_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `reimbursements`;
CREATE TABLE `reimbursements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rmb_number` varchar(50) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `payee` varchar(255) NOT NULL,
  `purpose` text DEFAULT NULL,
  `project` varchar(100) DEFAULT NULL,
  `project_address` varchar(255) DEFAULT NULL,
  `order_number` varchar(10) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `date_needed` date DEFAULT NULL,
  `status` enum('Draft','Pending','For Procurement Review','For Super Admin Final Approval','On Hold','For Purchase','PO Created','Payment Request Created','Completed','Rejected','Cancelled','Received') DEFAULT 'Draft',
  `remarks` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rmb_number` (`rmb_number`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `reimbursement_attachments`;
CREATE TABLE `reimbursement_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reimbursement_id` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reimbursement_id` (`reimbursement_id`),
  KEY `uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `service_requests`;
CREATE TABLE `service_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sr_number` varchar(50) NOT NULL COMMENT 'Format: SRV-YYYY-MM-XXX',
  `requested_by` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `description` text DEFAULT NULL COMMENT 'Detailed service description',
  `service_type` enum('Rent','Job Order','Contractor','Service','Others') NOT NULL DEFAULT 'Service',
  `project` varchar(100) DEFAULT NULL,
  `project_address` varchar(255) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL COMMENT 'Selected supplier/contractor',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `date_needed` date DEFAULT NULL,
  `status` enum('Draft','For Procurement Review','For Super Admin Final Approval','Approved','Payment Request Created','Payment Order Created','Rejected','Cancelled','PO Created','Paid','Received') DEFAULT 'Draft',
  `remarks` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `order_number` varchar(10) DEFAULT NULL,
  `payment_terms_note` text DEFAULT NULL,
  `sr_type` enum('payment_request','payment_order') DEFAULT 'payment_request' COMMENT 'Type: payment_request (amount+qty) vs payment_order (amount only)',
  `quantity` decimal(10,2) DEFAULT NULL COMMENT 'Quantity for payment_request type',
  `unit` varchar(20) DEFAULT NULL COMMENT 'Unit of measurement (e.g., pcs, hours, days)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sr_number` (`sr_number`),
  KEY `requested_by` (`requested_by`),
  KEY `supplier_id` (`supplier_id`),
  KEY `approved_by` (`approved_by`),
  KEY `status` (`status`),
  KEY `service_type` (`service_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_code` varchar(50) NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `supplier_code` (`supplier_code`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `supplier_items`;
CREATE TABLE `supplier_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `lead_time_days` int(11) DEFAULT NULL COMMENT 'Estimated delivery time in days',
  `is_preferred` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_supplier_item` (`supplier_id`,`item_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2026-04-09 00:19:46 UTC
