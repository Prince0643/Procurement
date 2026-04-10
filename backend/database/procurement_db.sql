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

INSERT INTO `cash_requests` (`id`, `cr_number`, `requested_by`, `purpose`, `description`, `amount`, `quantity`, `unit`, `project`, `project_address`, `date_needed`, `order_number`, `payment_terms_note`, `supplier_id`, `supplier_name`, `supplier_address`, `cr_type`, `status`, `remarks`, `rejection_reason`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(8,	'CR-MTN-2026-04-001',	5,	'test received',	'fds',	342.00,	1.00,	'pcs',	'BCDA - CCA',	'Poro point, San Fernando City, La Union',	'2026-04-10',	'393859493',	NULL,	2,	'Office Depot PH',	'456 Business Ave, Quezon City',	'payment_request',	'For Super Admin Final Approval',	NULL,	NULL,	6,	'2026-04-09 03:36:44',	'2026-04-09 03:36:05',	'2026-04-09 03:36:44'),
(9,	'CR-MTN-2026-04-002',	5,	'fdsfd',	NULL,	21.00,	1.00,	'pcs',	'BCDA - Admin',	'Poro point, San Fernando City, La Union',	'2026-04-18',	'393859493',	'fdsaseerr',	2,	'Office Depot PH',	'456 Business Ave, Quezon City',	'payment_request',	'Draft',	NULL,	NULL,	NULL,	NULL,	'2026-04-09 08:15:49',	'2026-04-09 08:15:49');

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

INSERT INTO `categories` (`id`, `category_name`, `description`, `status`, `created_by`, `created_at`) VALUES
(1,	'Electronics',	'Electronic components and devices',	'Active',	NULL,	'2026-02-09 08:25:53'),
(2,	'Office Supplies',	'General office supplies and stationery',	'Active',	NULL,	'2026-02-09 08:25:53'),
(3,	'Safety Equipment',	'Personal protective equipment and safety gear',	'Active',	NULL,	'2026-02-09 08:25:53'),
(4,	'Tools',	'Hand tools and power tools',	'Active',	NULL,	'2026-02-09 08:25:53'),
(5,	'Raw Materials',	'Raw materials for production',	'Active',	NULL,	'2026-02-09 08:25:53'),
(6,	'test',	'Just tests',	'Active',	NULL,	'2026-02-09 08:38:36');

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

INSERT INTO `employees` (`id`, `employee_no`, `first_name`, `middle_initial`, `last_name`, `role`, `department`, `password`, `is_active`, `created_at`, `updated_at`) VALUES
(5,	'ENG-2026-0001',	'Michelle',	'T',	'Norial',	'engineer',	'Engineering',	'$2a$10$te379KJk9Z8nAgG9hr1Ct.HuvvOC2sSt.i7YTr7IQEBfp1e2FylBK',	1,	'2026-02-10 02:36:33',	'2026-02-12 02:21:26'),
(6,	'PRO-2026-0001',	'Junnel',	'B',	'Tadina',	'procurement',	'Procurement',	'$2a$10$gqG3xZE0xaT/aA5BvUMpJeVQ3vbYoOoiqS2QP7HBC3XZwm.4qusQu',	1,	'2026-02-10 02:36:33',	'2026-02-11 04:13:17'),
(7,	'ADMIN-2026-0001',	'Elain',	'M',	'Torres',	'admin',	'Administration',	'$2a$10$gqG3xZE0xaT/aA5BvUMpJeVQ3vbYoOoiqS2QP7HBC3XZwm.4qusQu',	1,	'2026-02-10 02:36:33',	'2026-02-12 02:48:40'),
(8,	'SA-2026-004',	'Marc',	'J',	'Arzadon',	'super_admin',	'Management',	'$2a$10$Uy/JQQbCOdM1GlMIBBtW1unfNIesn.J5kulNtx1XaR2NcKDAtmyWS',	1,	'2026-02-10 02:36:33',	'2026-02-12 00:51:44'),
(9,	'ENG-2026-0002',	'John Kennedy',	'K',	'Lucas',	'engineer',	'Engineering',	'$2a$10$5WmbWmSvEq3gBe8cdW3RPefxhH6mQebKZ5/FYQ9FZd0WgLJdp6hDe',	1,	'2026-02-10 04:42:55',	'2026-02-11 04:13:26'),
(10,	'SA001',	'Super',	'D',	'Adminesu',	'super_admin',	'Management',	'$2a$10$2VAa8J7EZDnfspG1/t4G1ez6MXGEnf3DLiPNqcJEm4ypE0p9RATNq',	1,	'2026-02-12 00:55:00',	'2026-02-12 02:48:05'),
(11,	'ENG-2026-0003',	'Julius John',	'F',	'Echague',	'engineer',	'Engineering',	'$2a$10$SgSe2J/dqlMH.uPUVkXYQePzJfBd744bL2THGSA3x1B6Wm53oJlMC',	1,	'2026-02-12 02:44:49',	'2026-02-12 02:50:14'),
(12,	'ENG-2026-0005',	'Joylene',	'F',	'Balanon',	'engineer',	'Engineering',	'$2a$10$fFUgVn7r1fE8YPLnwcTDZOhWhEhjxY1gg3rULIps0uoMBVsBE95W.',	1,	'2026-02-12 02:45:21',	'2026-02-12 02:50:16'),
(13,	'ENG-2026-0006',	'Winnielyn Kaye',	'W',	'Olarte',	'engineer',	'Procurement',	'$2a$10$.GDmwlv/XvEmPJzt3oIb0.39RVYiJMsxBwcTaMbmFInk3th76KpIu',	1,	'2026-02-12 02:45:41',	'2026-02-12 02:54:11'),
(14,	'ADMIN-2026-0002',	'Ronalyn',	'W',	'Mallare',	'admin',	'Administration',	'$2a$10$zZXZI/tYRPS37ZQVDeThpeaBi5uCv1P1e1EsBkScqRmt/1.iZPFWK',	1,	'2026-02-12 02:46:45',	'2026-02-12 02:50:21'),
(15,	'ADMIN-2026-0003',	'Admin',	'G',	'Charisse',	'admin',	'Administration',	'$2a$10$a1JGadOlyuKzlNVK.ydC0ucBTKkg8c8u1CyNBmlLRDI.SzKKYXtOK',	1,	'2026-02-12 02:47:14',	'2026-02-12 02:50:24'),
(16,	'ADMIN-2026-0004',	'Marjorie',	'O',	'Garcia',	'admin',	'Administration',	'$2a$10$pj5HrIzaIYIkWlCbcOy9sOBNxrQitgV2.Umuh.wldfJWEYy5t0Ta6',	1,	'2026-02-12 02:47:46',	'2026-02-12 02:50:28');

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

INSERT INTO `items` (`id`, `item_code`, `item_name`, `description`, `category_id`, `unit`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(1,	'ITM001',	'Laptop Dell Latitude',	'Business laptop 15.6 inch',	1,	'pcs',	NULL,	'Active',	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(2,	'ITM002',	'A4 Paper (Ream)',	'Premium quality A4 paper',	2,	'reams',	NULL,	'Active',	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(3,	'ITM003',	'Safety Helmet',	'Hard hat for construction',	3,	'pcs',	NULL,	'Active',	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(4,	'ITM004',	'Cordless Drill',	'18V cordless drill driver',	4,	'pcs',	NULL,	'Active',	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(5,	'ITM005',	'Steel Rod 10mm',	'Mild steel reinforcement rod',	5,	'meters',	NULL,	'Active',	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(6,	'ITM006',	'Brother Printer',	'Printer for office',	1,	'pcs',	NULL,	'Active',	'2026-02-09 08:37:53',	'2026-02-12 02:38:15'),
(7,	'ITM007',	'Office Chair',	'Chair for office',	6,	'pcs',	NULL,	'Active',	'2026-02-09 08:38:37',	'2026-02-12 02:38:42');

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'System',
  `related_id` int(11) DEFAULT NULL COMMENT 'ID of related record (PR, PO, etc.)',
  `related_type` varchar(50) DEFAULT NULL COMMENT 'Type of related record',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `recipient_id` (`recipient_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`id`, `recipient_id`, `title`, `message`, `type`, `related_id`, `related_type`, `is_read`, `created_at`) VALUES
(380,	6,	'New Service Request',	'Service Request SRV-MTN-2026-04-001 has been submitted and requires your review',	'PR Created',	12,	'service_request',	1,	'2026-04-09 00:40:36'),
(381,	8,	'SR Pending Final Approval',	'Service Request SRV-MTN-2026-04-001 has been reviewed by Procurement and requires your final approval',	'PR Approved',	12,	'service_request',	0,	'2026-04-09 00:40:53'),
(382,	10,	'SR Pending Final Approval',	'Service Request SRV-MTN-2026-04-001 has been reviewed by Procurement and requires your final approval',	'PR Approved',	12,	'service_request',	0,	'2026-04-09 00:40:53'),
(383,	5,	'Service Request Fully Approved',	'Your Service Request SRV-MTN-2026-04-001 has been fully approved and is ready for PO creation',	'PR Approved',	12,	'service_request',	1,	'2026-04-09 00:41:14'),
(384,	7,	'SR Ready for PO Creation',	'Service Request SRV-MTN-2026-04-001 has been approved and is ready for PO creation',	'PR Approved',	12,	'service_request',	1,	'2026-04-09 00:41:14'),
(385,	14,	'SR Ready for PO Creation',	'Service Request SRV-MTN-2026-04-001 has been approved and is ready for PO creation',	'PR Approved',	12,	'service_request',	0,	'2026-04-09 00:41:14'),
(386,	15,	'SR Ready for PO Creation',	'Service Request SRV-MTN-2026-04-001 has been approved and is ready for PO creation',	'PR Approved',	12,	'service_request',	0,	'2026-04-09 00:41:14'),
(387,	16,	'SR Ready for PO Creation',	'Service Request SRV-MTN-2026-04-001 has been approved and is ready for PO creation',	'PR Approved',	12,	'service_request',	0,	'2026-04-09 00:41:14'),
(388,	8,	'New PO Pending Approval',	'Purchase Order ETN-2026-04-004 has been created and requires your approval',	'PO Created',	21,	'purchase_order',	1,	'2026-04-09 02:04:13'),
(389,	10,	'New PO Pending Approval',	'Purchase Order ETN-2026-04-004 has been created and requires your approval',	'PO Created',	21,	'purchase_order',	0,	'2026-04-09 02:04:13'),
(390,	7,	'New Cash Request',	'Cash Request CR-MTN-2026-04-001 has been submitted and requires your approval',	'PR Created',	8,	'cash_request',	0,	'2026-04-09 03:36:13'),
(391,	14,	'New Cash Request',	'Cash Request CR-MTN-2026-04-001 has been submitted and requires your approval',	'PR Created',	8,	'cash_request',	0,	'2026-04-09 03:36:13'),
(392,	15,	'New Cash Request',	'Cash Request CR-MTN-2026-04-001 has been submitted and requires your approval',	'PR Created',	8,	'cash_request',	0,	'2026-04-09 03:36:13'),
(393,	16,	'New Cash Request',	'Cash Request CR-MTN-2026-04-001 has been submitted and requires your approval',	'PR Created',	8,	'cash_request',	0,	'2026-04-09 03:36:13'),
(394,	5,	'Cash Request Approved by Admin',	'Your Cash Request CR-MTN-2026-04-001 has been approved by admin and is waiting for Super Admin final approval',	'PR Approved',	8,	'cash_request',	1,	'2026-04-09 03:36:44'),
(395,	6,	'New PR Created',	'Purchase Request JBT-2026-04-001 has been created and is ready for your review',	'PR Created',	41,	'purchase_request',	1,	'2026-04-09 03:55:05'),
(396,	8,	'PR Pending Final Approval',	'Purchase Request JBT-2026-04-001 has been reviewed by Procurement and requires your final approval',	'PR Approved',	41,	'purchase_request',	0,	'2026-04-09 07:08:08'),
(397,	10,	'PR Pending Final Approval',	'Purchase Request JBT-2026-04-001 has been reviewed by Procurement and requires your final approval',	'PR Approved',	41,	'purchase_request',	0,	'2026-04-09 07:08:08'),
(398,	6,	'New PR Created',	'Purchase Request JBT-2026-04-002 has been created and is ready for your review',	'PR Created',	42,	'purchase_request',	0,	'2026-04-09 07:11:36'),
(399,	6,	'New PR Created',	'Purchase Request JBT-2026-04-003 has been created and is ready for your review',	'PR Created',	43,	'purchase_request',	0,	'2026-04-09 07:38:32');

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

INSERT INTO `pricing_history` (`id`, `item_id`, `supplier_id`, `unit_price`, `quantity`, `total_amount`, `purchase_order_id`, `purchase_request_id`, `po_number`, `pr_number`, `date_recorded`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(28,	1,	1,	250.00,	100.00,	25000.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-15',	'Bulk purchase for Project Alpha',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(29,	1,	1,	255.00,	50.00,	12750.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-20',	'Additional order',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(30,	1,	2,	248.00,	100.00,	24800.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-10',	'New supplier trial',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(31,	1,	1,	260.00,	75.00,	19500.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-05',	'Price increase due to demand',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(32,	2,	3,	450.00,	200.00,	90000.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-10',	'Construction materials',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(33,	2,	3,	445.00,	150.00,	66750.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-15',	'Negotiated discount',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(34,	2,	1,	455.00,	100.00,	45500.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-20',	'Emergency restock',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(35,	3,	2,	850.00,	10.00,	8500.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-20',	'Truck load delivery',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(36,	3,	2,	820.00,	15.00,	12300.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-25',	'Volume discount applied',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(37,	3,	4,	875.00,	8.00,	7000.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-15',	'Alternative supplier',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(38,	4,	2,	750.00,	12.00,	9000.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-25',	'Foundation work',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(39,	4,	2,	740.00,	20.00,	14800.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-05',	'Large project order',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(40,	5,	4,	1200.00,	25.00,	30000.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-01',	'Interior painting project',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(41,	5,	4,	1150.00,	30.00,	34500.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-25',	'Bulk discount negotiated',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(42,	5,	1,	1250.00,	10.00,	12500.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-10',	'Premium grade paint',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(43,	6,	3,	45.00,	500.00,	22500.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-10',	'Wiring for new building',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(44,	6,	3,	42.00,	1000.00,	42000.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-30',	'Large scale project',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(45,	7,	2,	180.00,	50.00,	9000.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-30',	'Plumbing installation',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(46,	7,	4,	175.00,	75.00,	13125.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-12',	'Better pricing found',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(47,	7,	2,	185.00,	40.00,	7400.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-08',	'Quality preferred over price',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(48,	8,	1,	35.00,	1000.00,	35000.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-20',	'Complete roof replacement',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(49,	8,	1,	33.00,	500.00,	16500.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-01',	'Loyalty discount',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(50,	9,	4,	2500.00,	20.00,	50000.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-01',	'Office building windows',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(51,	9,	3,	2450.00,	15.00,	36750.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-15',	'Competitive bid',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(52,	10,	1,	650.00,	100.00,	65000.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-05',	'Framing materials',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(53,	10,	1,	625.00,	150.00,	93750.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-28',	'Volume discount',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(54,	10,	2,	640.00,	80.00,	51200.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-20',	'Alternative source',	NULL,	'2026-03-06 07:44:53',	'2026-03-06 07:44:53'),
(55,	1,	1,	245.00,	100.00,	24500.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-15',	'January bulk order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(56,	1,	1,	248.00,	80.00,	19840.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-10',	'February order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(57,	1,	1,	255.00,	120.00,	30600.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-20',	'March - price increase',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(58,	1,	1,	252.00,	90.00,	22680.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-12',	'April order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(59,	1,	1,	260.00,	100.00,	26000.00,	NULL,	NULL,	NULL,	NULL,	'2025-05-15',	'May - peak season pricing',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(60,	1,	1,	258.00,	110.00,	28380.00,	NULL,	NULL,	NULL,	NULL,	'2025-06-18',	'June order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(61,	1,	1,	265.00,	95.00,	25175.00,	NULL,	NULL,	NULL,	NULL,	'2025-07-22',	'July - high demand',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(62,	1,	1,	262.00,	85.00,	22270.00,	NULL,	NULL,	NULL,	NULL,	'2025-08-14',	'August order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(63,	1,	1,	255.00,	100.00,	25500.00,	NULL,	NULL,	NULL,	NULL,	'2025-09-16',	'September - price drop',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(64,	1,	1,	250.00,	120.00,	30000.00,	NULL,	NULL,	NULL,	NULL,	'2025-10-20',	'October bulk order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(65,	1,	1,	248.00,	90.00,	22320.00,	NULL,	NULL,	NULL,	NULL,	'2025-11-15',	'November order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(66,	1,	1,	252.00,	100.00,	25200.00,	NULL,	NULL,	NULL,	NULL,	'2025-12-10',	'December year-end order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(67,	1,	2,	242.00,	50.00,	12100.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-20',	'Jan - Supplier 2 trial',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(68,	1,	2,	245.00,	60.00,	14700.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-05',	'Mar - Supplier 2',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(69,	1,	2,	250.00,	70.00,	17500.00,	NULL,	NULL,	NULL,	NULL,	'2025-05-08',	'May - Supplier 2',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(70,	1,	2,	248.00,	55.00,	13640.00,	NULL,	NULL,	NULL,	NULL,	'2025-07-12',	'Jul - Supplier 2',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(71,	1,	2,	245.00,	80.00,	19600.00,	NULL,	NULL,	NULL,	NULL,	'2025-09-20',	'Sep - Supplier 2',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(72,	1,	2,	240.00,	65.00,	15600.00,	NULL,	NULL,	NULL,	NULL,	'2025-11-25',	'Nov - Supplier 2 discount',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(73,	2,	3,	440.00,	150.00,	66000.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-10',	'January steel order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(74,	2,	3,	445.00,	120.00,	53400.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-15',	'February steel',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(75,	2,	3,	450.00,	180.00,	81000.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-25',	'March steel - price up',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(76,	2,	3,	455.00,	140.00,	63700.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-18',	'April steel',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(77,	2,	3,	460.00,	160.00,	73600.00,	NULL,	NULL,	NULL,	NULL,	'2025-05-22',	'May steel - peak pricing',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(78,	2,	3,	458.00,	130.00,	59540.00,	NULL,	NULL,	NULL,	NULL,	'2025-06-14',	'June steel',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(79,	2,	3,	465.00,	170.00,	79050.00,	NULL,	NULL,	NULL,	NULL,	'2025-07-28',	'July steel - high demand',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(80,	2,	3,	462.00,	145.00,	66990.00,	NULL,	NULL,	NULL,	NULL,	'2025-08-16',	'August steel',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(81,	2,	3,	455.00,	155.00,	70525.00,	NULL,	NULL,	NULL,	NULL,	'2025-09-24',	'September steel - slight drop',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(82,	2,	3,	450.00,	175.00,	78750.00,	NULL,	NULL,	NULL,	NULL,	'2025-10-30',	'October steel',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(83,	2,	3,	448.00,	140.00,	62720.00,	NULL,	NULL,	NULL,	NULL,	'2025-11-20',	'November steel',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(84,	2,	3,	452.00,	160.00,	72320.00,	NULL,	NULL,	NULL,	NULL,	'2025-12-15',	'December steel',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(85,	5,	4,	1150.00,	20.00,	23000.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-08',	'January paint order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(86,	5,	4,	1180.00,	25.00,	29500.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-14',	'February paint',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(87,	5,	4,	1200.00,	30.00,	36000.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-22',	'March paint - spring projects',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(88,	5,	4,	1220.00,	35.00,	42700.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-28',	'April paint - high season',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(89,	5,	4,	1250.00,	40.00,	50000.00,	NULL,	NULL,	NULL,	NULL,	'2025-05-30',	'May paint - peak season',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(90,	5,	4,	1240.00,	32.00,	39680.00,	NULL,	NULL,	NULL,	NULL,	'2025-06-18',	'June paint',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(91,	5,	4,	1220.00,	28.00,	34160.00,	NULL,	NULL,	NULL,	NULL,	'2025-07-25',	'July paint',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(92,	5,	4,	1200.00,	30.00,	36000.00,	NULL,	NULL,	NULL,	NULL,	'2025-08-20',	'August paint',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(93,	5,	4,	1180.00,	35.00,	41300.00,	NULL,	NULL,	NULL,	NULL,	'2025-09-26',	'September paint',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(94,	5,	4,	1150.00,	42.00,	48300.00,	NULL,	NULL,	NULL,	NULL,	'2025-10-15',	'October paint - bulk order',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(95,	5,	4,	1120.00,	38.00,	42560.00,	NULL,	NULL,	NULL,	NULL,	'2025-11-22',	'November paint - discount',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(96,	5,	4,	1100.00,	45.00,	49500.00,	NULL,	NULL,	NULL,	NULL,	'2025-12-18',	'December paint - year end sale',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(97,	10,	1,	620.00,	80.00,	49600.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-12',	'January lumber',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(98,	10,	1,	635.00,	75.00,	47625.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-18',	'February lumber',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(99,	10,	1,	650.00,	90.00,	58500.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-24',	'March lumber',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(100,	10,	1,	665.00,	85.00,	56525.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-16',	'April lumber - price up',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(101,	10,	1,	680.00,	95.00,	64600.00,	NULL,	NULL,	NULL,	NULL,	'2025-05-28',	'May lumber - peak price',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(102,	10,	1,	675.00,	88.00,	59400.00,	NULL,	NULL,	NULL,	NULL,	'2025-06-22',	'June lumber',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(103,	10,	1,	660.00,	82.00,	54120.00,	NULL,	NULL,	NULL,	NULL,	'2025-07-19',	'July lumber - slight drop',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(104,	10,	1,	655.00,	78.00,	51090.00,	NULL,	NULL,	NULL,	NULL,	'2025-08-25',	'August lumber',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(105,	10,	1,	645.00,	85.00,	54825.00,	NULL,	NULL,	NULL,	NULL,	'2025-09-17',	'September lumber',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(106,	10,	1,	640.00,	92.00,	58880.00,	NULL,	NULL,	NULL,	NULL,	'2025-10-24',	'October lumber',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(107,	10,	1,	630.00,	87.00,	54810.00,	NULL,	NULL,	NULL,	NULL,	'2025-11-21',	'November lumber',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(108,	10,	1,	625.00,	95.00,	59375.00,	NULL,	NULL,	NULL,	NULL,	'2025-12-16',	'December lumber',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(109,	6,	3,	42.00,	400.00,	16800.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-25',	'January wire',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(110,	6,	3,	43.00,	380.00,	16340.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-20',	'February wire',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(111,	6,	3,	44.00,	420.00,	18480.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-28',	'March wire',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(112,	6,	3,	45.00,	450.00,	20250.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-22',	'April wire',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(113,	6,	3,	46.00,	480.00,	22080.00,	NULL,	NULL,	NULL,	NULL,	'2025-05-18',	'May wire',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(114,	6,	3,	45.50,	460.00,	20930.00,	NULL,	NULL,	NULL,	NULL,	'2025-06-24',	'June wire',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(115,	6,	3,	44.00,	440.00,	19360.00,	NULL,	NULL,	NULL,	NULL,	'2025-07-30',	'July wire - price drop',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(116,	6,	3,	43.50,	470.00,	20445.00,	NULL,	NULL,	NULL,	NULL,	'2025-08-26',	'August wire',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(117,	6,	3,	42.00,	500.00,	21000.00,	NULL,	NULL,	NULL,	NULL,	'2025-09-21',	'September wire - bulk',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(118,	6,	3,	41.00,	520.00,	21320.00,	NULL,	NULL,	NULL,	NULL,	'2025-10-27',	'October wire - discount',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(119,	6,	3,	40.50,	480.00,	19440.00,	NULL,	NULL,	NULL,	NULL,	'2025-11-19',	'November wire',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(120,	6,	3,	41.00,	550.00,	22550.00,	NULL,	NULL,	NULL,	NULL,	'2025-12-28',	'December wire - year end stock',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(121,	7,	2,	175.00,	60.00,	10500.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-30',	'January pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(122,	7,	2,	178.00,	55.00,	9790.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-25',	'February pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(123,	7,	2,	180.00,	70.00,	12600.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-20',	'March pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(124,	7,	2,	182.00,	65.00,	11830.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-28',	'April pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(125,	7,	2,	185.00,	80.00,	14800.00,	NULL,	NULL,	NULL,	NULL,	'2025-05-26',	'May pipes - peak season',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(126,	7,	2,	183.00,	72.00,	13176.00,	NULL,	NULL,	NULL,	NULL,	'2025-06-22',	'June pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(127,	7,	2,	180.00,	68.00,	12240.00,	NULL,	NULL,	NULL,	NULL,	'2025-07-18',	'July pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(128,	7,	2,	178.00,	75.00,	13350.00,	NULL,	NULL,	NULL,	NULL,	'2025-08-24',	'August pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(129,	7,	2,	176.00,	62.00,	10912.00,	NULL,	NULL,	NULL,	NULL,	'2025-09-29',	'September pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(130,	7,	2,	174.00,	85.00,	14790.00,	NULL,	NULL,	NULL,	NULL,	'2025-10-31',	'October pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(131,	7,	2,	172.00,	78.00,	13416.00,	NULL,	NULL,	NULL,	NULL,	'2025-11-23',	'November pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(132,	7,	2,	175.00,	90.00,	15750.00,	NULL,	NULL,	NULL,	NULL,	'2025-12-19',	'December pipes',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(133,	8,	1,	32.00,	800.00,	25600.00,	NULL,	NULL,	NULL,	NULL,	'2025-01-15',	'January tiles',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(134,	8,	1,	33.00,	750.00,	24750.00,	NULL,	NULL,	NULL,	NULL,	'2025-02-28',	'February tiles',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(135,	8,	1,	34.00,	900.00,	30600.00,	NULL,	NULL,	NULL,	NULL,	'2025-03-25',	'March tiles - pre-season',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(136,	8,	1,	35.00,	1000.00,	35000.00,	NULL,	NULL,	NULL,	NULL,	'2025-04-30',	'April tiles - construction season',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(137,	8,	1,	36.00,	1200.00,	43200.00,	NULL,	NULL,	NULL,	NULL,	'2025-05-28',	'May tiles - peak season',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(138,	8,	1,	36.50,	1100.00,	40150.00,	NULL,	NULL,	NULL,	NULL,	'2025-06-26',	'June tiles',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(139,	8,	1,	35.50,	1050.00,	37275.00,	NULL,	NULL,	NULL,	NULL,	'2025-07-24',	'July tiles',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(140,	8,	1,	34.50,	950.00,	32775.00,	NULL,	NULL,	NULL,	NULL,	'2025-08-22',	'August tiles',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(141,	8,	1,	34.00,	880.00,	29920.00,	NULL,	NULL,	NULL,	NULL,	'2025-09-20',	'September tiles',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(142,	8,	1,	33.00,	920.00,	30360.00,	NULL,	NULL,	NULL,	NULL,	'2025-10-18',	'October tiles',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(143,	8,	1,	32.50,	850.00,	27625.00,	NULL,	NULL,	NULL,	NULL,	'2025-11-16',	'November tiles',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(144,	8,	1,	33.00,	780.00,	25740.00,	NULL,	NULL,	NULL,	NULL,	'2025-12-14',	'December tiles',	NULL,	'2026-03-06 07:52:03',	'2026-03-06 07:52:03'),
(145,	2,	4,	0.21,	1.00,	0.21,	15,	32,	'ETN-2026-03-001',	'MTN-2026-03-001',	'2026-03-10',	'Auto-recorded from PO ETN-2026-03-001',	NULL,	'2026-03-10 02:20:27',	'2026-03-10 02:20:27'),
(146,	6,	4,	320.00,	1.00,	320.00,	15,	32,	'ETN-2026-03-001',	'MTN-2026-03-001',	'2026-03-10',	'Auto-recorded from PO ETN-2026-03-001',	NULL,	'2026-03-10 02:20:27',	'2026-03-10 02:20:27'),
(147,	2,	2,	34.00,	3432.00,	116688.00,	16,	34,	'ETN-2026-03-002',	'EMT-2026-03-001',	'2026-03-10',	'Auto-recorded from PO ETN-2026-03-002',	NULL,	'2026-03-10 02:35:35',	'2026-03-10 02:35:35'),
(148,	6,	2,	45.00,	121.00,	5445.00,	16,	34,	'ETN-2026-03-002',	'EMT-2026-03-001',	'2026-03-10',	'Auto-recorded from PO ETN-2026-03-002',	NULL,	'2026-03-10 02:35:35',	'2026-03-10 02:35:35'),
(149,	2,	3,	43.00,	1.00,	43.00,	17,	35,	'ETN-2026-03-003',	'WWO-2026-03-001',	'2026-03-10',	'Auto-recorded from PO ETN-2026-03-003',	NULL,	'2026-03-10 06:08:35',	'2026-03-10 06:08:35'),
(150,	6,	3,	78.00,	1.00,	78.00,	17,	35,	'ETN-2026-03-003',	'WWO-2026-03-001',	'2026-03-10',	'Auto-recorded from PO ETN-2026-03-003',	NULL,	'2026-03-10 06:08:35',	'2026-03-10 06:08:35');

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

INSERT INTO `purchase_orders` (`id`, `po_number`, `purchase_request_id`, `service_request_id`, `supplier_id`, `prepared_by`, `total_amount`, `po_date`, `expected_delivery_date`, `actual_delivery_date`, `status`, `created_at`, `updated_at`, `place_of_delivery`, `delivery_term`, `payment_term`, `project`, `notes`, `order_number`, `po_type`) VALUES
(18,	'ETN-2026-04-001',	NULL,	12,	2,	7,	0.00,	'2026-04-09',	'2026-04-11',	NULL,	'On Hold',	'2026-04-09 01:54:40',	'2026-04-09 02:05:20',	'fdsasd',	'COD',	'CASH',	'Test received',	NULL,	'393859493',	'payment_order'),
(19,	'ETN-2026-04-002',	NULL,	12,	2,	7,	0.00,	'2026-04-09',	'2026-04-10',	NULL,	'On Hold',	'2026-04-09 01:59:35',	'2026-04-09 02:05:20',	'fdsfds',	'COD',	'CASH',	'Test received',	NULL,	'393859493',	'payment_order'),
(20,	'ETN-2026-04-003',	NULL,	12,	2,	7,	0.00,	'2026-04-09',	'2026-04-10',	NULL,	'On Hold',	'2026-04-09 02:00:19',	'2026-04-09 02:05:19',	'fdsfds',	'COD',	'CASH',	'Test received',	NULL,	'393859493',	'payment_order'),
(21,	'ETN-2026-04-004',	NULL,	12,	2,	7,	21.00,	'2026-04-09',	'2026-04-10',	NULL,	'Approved',	'2026-04-09 02:04:13',	'2026-04-09 02:05:11',	NULL,	'COD',	'CASH',	'Test received',	NULL,	'393859493',	'payment_order');

DROP TABLE IF EXISTS `purchase_order_items`;
CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int(11) NOT NULL,
  `purchase_request_item_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
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
  KEY `purchase_requests_payment_terms_set_by_fk` (`payment_terms_set_by`),
  CONSTRAINT `purchase_requests_payment_terms_set_by_fk` FOREIGN KEY (`payment_terms_set_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `purchase_requests` (`id`, `pr_number`, `requested_by`, `purpose`, `remarks`, `date_needed`, `project`, `project_address`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `total_amount`, `created_at`, `updated_at`, `supplier_id`, `supplier_address`, `order_number`, `payment_basis`, `payment_terms_code`, `payment_terms_note`, `payment_terms_set_by`, `payment_terms_set_at`) VALUES
(41,	'JBT-2026-04-001',	6,	'fdsa',	'',	'2026-04-10',	'BCDA - CCA',	'Poro point, San Fernando City, La Union',	'For Super Admin Final Approval',	NULL,	NULL,	NULL,	53.00,	'2026-04-09 03:55:05',	'2026-04-09 07:08:08',	3,	'789 Industrial Rd, Makati',	'393859493',	'debt',	'NET_15',	NULL,	6,	'2026-04-09 07:08:08'),
(42,	'JBT-2026-04-002',	6,	'prfds',	'',	'2026-04-16',	'BCDA - Control Tower',	'Poro point, San Fernando City, La Union',	'For Procurement Review',	NULL,	NULL,	NULL,	66.00,	'2026-04-09 07:11:36',	'2026-04-09 07:11:36',	3,	'789 Industrial Rd, Makati',	'393859493',	'debt',	NULL,	NULL,	NULL,	NULL),
(43,	'JBT-2026-04-003',	6,	'fdsfds',	'',	'2026-04-16',	'BCDA - CCTV',	'Poro point, San Fernando City, La Union',	'For Procurement Review',	NULL,	NULL,	NULL,	0.00,	'2026-04-09 07:38:32',	'2026-04-09 07:38:32',	2,	'456 Business Ave, Quezon City',	'393859493',	'debt',	'CUSTOM',	'TnC testss',	6,	'2026-04-09 15:38:32');

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

INSERT INTO `purchase_request_items` (`id`, `purchase_request_id`, `item_id`, `quantity`, `unit_price`, `total_price`, `unit`, `remarks`, `status`, `received_by`, `received_at`, `created_at`) VALUES
(170,	41,	2,	1,	21.00,	21.00,	'reams',	NULL,	'Pending',	NULL,	NULL,	'2026-04-09 03:55:05'),
(171,	41,	6,	1,	32.00,	32.00,	'pcs',	NULL,	'Pending',	NULL,	NULL,	'2026-04-09 03:55:05'),
(172,	42,	2,	1,	43.00,	43.00,	NULL,	NULL,	'Pending',	NULL,	NULL,	'2026-04-09 07:11:36'),
(173,	42,	6,	1,	23.00,	23.00,	NULL,	NULL,	'Pending',	NULL,	NULL,	'2026-04-09 07:11:36'),
(174,	43,	2,	1,	0.00,	0.00,	NULL,	NULL,	'Pending',	NULL,	NULL,	'2026-04-09 07:38:32');

DROP TABLE IF EXISTS `payment_schedule_reminder_logs`;
DROP TABLE IF EXISTS `purchase_request_payment_schedules`;
CREATE TABLE `purchase_request_payment_schedules` (
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

CREATE TABLE `payment_schedule_reminder_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` int(11) NOT NULL,
  `reminder_type` varchar(20) NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_schedule_reminder` (`schedule_id`,`reminder_type`),
  KEY `idx_psrl_type_sent_at` (`reminder_type`,`sent_at`),
  CONSTRAINT `fk_reminder_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `purchase_request_payment_schedules` (`id`) ON DELETE CASCADE
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
  `payment_terms_note` text DEFAULT NULL,
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

INSERT INTO `reimbursements` (`id`, `rmb_number`, `requested_by`, `payee`, `purpose`, `project`, `project_address`, `order_number`, `payment_terms_note`, `amount`, `date_needed`, `status`, `remarks`, `rejection_reason`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(4,	'RMB-JBT-2026-04-001',	6,	'Prince ',	'Test',	'BCDA - CCTV',	'Poro point, San Fernando City, La Union',	'393859493',	NULL,	1222009.00,	'2026-04-18',	'For Procurement Review',	NULL,	NULL,	NULL,	NULL,	'2026-04-09 03:48:15',	'2026-04-09 03:48:15'),
(5,	'RMB-MTN-2026-04-001',	5,	'fdsafs',	'gfd',	'BCDA - CCTV',	'Poro point, San Fernando City, La Union',	'393859493',	'fdsafdas',	123.00,	'2026-04-16',	'For Procurement Review',	'fds',	NULL,	NULL,	NULL,	'2026-04-09 08:16:07',	'2026-04-09 08:16:07'),
(6,	'RMB-MTN-2026-04-002',	5,	'test',	'test',	'BCDA - Control Tower',	'Poro point, San Fernando City, La Union',	'393859493',	'test',	100.00,	'2026-04-17',	'For Procurement Review',	'fds',	NULL,	NULL,	NULL,	'2026-04-09 23:55:12',	'2026-04-09 23:55:12'),
(7,	'RMB-MTN-2026-04-003',	5,	'test',	'fdsfg',	'BCDA - Control Tower',	'Poro point, San Fernando City, La Union',	'393859493',	'fdsfds',	100.00,	'2026-10-23',	'For Procurement Review',	NULL,	NULL,	NULL,	NULL,	'2026-04-10 00:14:20',	'2026-04-10 00:14:20');

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

INSERT INTO `reimbursement_attachments` (`id`, `reimbursement_id`, `file_path`, `file_name`, `file_size`, `mime_type`, `uploaded_by`, `uploaded_at`) VALUES
(2,	5,	'/uploads/reimbursements/rmb_5_1775722743049-481230106_purple-girl_wallpaper.png',	'purple-girl wallpaper.png',	1053870,	'image/png',	5,	'2026-04-09 08:19:03');

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

INSERT INTO `service_requests` (`id`, `sr_number`, `requested_by`, `purpose`, `description`, `service_type`, `project`, `project_address`, `supplier_id`, `amount`, `date_needed`, `status`, `remarks`, `rejection_reason`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `order_number`, `payment_terms_note`, `sr_type`, `quantity`, `unit`) VALUES
(12,	'SRV-MTN-2026-04-001',	5,	'Test received',	NULL,	'Others',	'BCDA - Control Tower',	'Poro point, San Fernando City, La Union',	2,	21.00,	'2026-04-25',	'Received',	NULL,	NULL,	8,	'2026-04-09 00:41:14',	'2026-04-09 00:40:15',	'2026-04-09 02:05:41',	'393859493',	NULL,	'payment_request',	10.00,	'hours'),
(14,	'SRV-MTN-2026-04-002',	5,	'fdsfs',	'fd',	'Service',	'BCDA - CCA',	'Poro point, San Fernando City, La Union',	2,	12.00,	'2026-04-10',	'Draft',	NULL,	NULL,	NULL,	NULL,	'2026-04-09 08:15:23',	'2026-04-09 08:15:23',	'393859493',	'fdsfds',	'payment_request',	12.00,	'hrs');

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

INSERT INTO `suppliers` (`id`, `supplier_code`, `supplier_name`, `contact_person`, `email`, `phone`, `address`, `status`, `created_at`, `updated_at`) VALUES
(1,	'SUP001',	'Tech Supplies Inc',	'Robert Wilson',	'robert@techsupplies.com',	'09123456789',	'123 Main St, Manila',	'Active',	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(2,	'SUP002',	'Office Depot PH',	'Maria Garcia',	'maria@officedepot.ph',	'09234567890',	'456 Business Ave, Quezon City',	'Active',	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(3,	'SUP003',	'Safety First Co',	'David Lee',	'david@safetyfirst.com',	'09345678901',	'789 Industrial Rd, Makati',	'Active',	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(4,	'SUP985580',	'Mairah and Co',	'Bianca Mairah',	'ladyshorty05@gmail.com',	'+639460926306',	'Sevilla, San Fernando City, La Union, Philippines\nSevilla, La Union',	'Active',	'2026-02-10 02:03:05',	'2026-02-12 02:40:00');

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

INSERT INTO `supplier_items` (`id`, `supplier_id`, `item_id`, `price`, `lead_time_days`, `is_preferred`, `created_at`, `updated_at`) VALUES
(1,	1,	1,	45000.00,	7,	0,	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(2,	1,	4,	8500.00,	3,	0,	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(3,	2,	2,	280.00,	1,	0,	'2026-02-09 08:25:53',	'2026-02-09 08:25:53'),
(4,	3,	3,	450.00,	2,	0,	'2026-02-09 08:25:53',	'2026-02-09 08:25:53');

-- 2026-04-10 00:55:22 UTC
