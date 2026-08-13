-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 13, 2026 at 01:30 AM
-- Server version: 8.4.7
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `procurement_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cash_requests`
--

DROP TABLE IF EXISTS `cash_requests`;
CREATE TABLE IF NOT EXISTS `cash_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cr_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `requested_by` int NOT NULL,
  `purpose` text COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `quantity` decimal(10,2) DEFAULT '1.00',
  `unit` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pcs',
  `project` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `project_address` text COLLATE utf8mb4_general_ci,
  `date_needed` date DEFAULT NULL,
  `order_number` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_terms_note` text COLLATE utf8mb4_general_ci,
  `supplier_id` int DEFAULT NULL,
  `supplier_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `supplier_address` text COLLATE utf8mb4_general_ci,
  `cr_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'payment_request',
  `status` enum('Draft','For Procurement Review','For Super Admin Final Approval','Approved','Cash Request Created','On Hold','Rejected','Received') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_general_ci,
  `rejection_reason` text COLLATE utf8mb4_general_ci,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cr_number` (`cr_number`),
  KEY `supplier_id` (`supplier_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_cr_status` (`status`),
  KEY `idx_cr_requested_by` (`requested_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cash_request_payment_schedules`
--

DROP TABLE IF EXISTS `cash_request_payment_schedules`;
CREATE TABLE IF NOT EXISTS `cash_request_payment_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cash_request_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cr_payment_date` (`cash_request_id`,`payment_date`),
  KEY `idx_crps_payment_date` (`payment_date`),
  KEY `fk_cr_schedule_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cash_schedule_reminder_logs`
--

DROP TABLE IF EXISTS `cash_schedule_reminder_logs`;
CREATE TABLE IF NOT EXISTS `cash_schedule_reminder_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `reminder_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cr_schedule_reminder` (`schedule_id`,`reminder_type`),
  KEY `idx_csrl_type_sent_at` (`reminder_type`,`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `category_name`, `description`, `status`, `created_by`, `created_at`) VALUES
(1, 'Electronics', 'Computers, monitors, printers, and IT accessories', 'Active', NULL, '2026-05-22 02:01:44'),
(2, 'Office Supplies', 'Paper, pens, folders, and general stationery', 'Active', NULL, '2026-05-22 02:01:44'),
(3, 'Safety Equipment', 'PPE, helmets, gloves, vests, and site safety gear', 'Active', NULL, '2026-05-22 02:01:44'),
(4, 'Tools & Hardware', 'Hand tools, power tools, fasteners, and hardware', 'Active', NULL, '2026-05-22 02:01:44'),
(5, 'Raw Materials', 'Cement, steel, lumber, aggregates, and building materials', 'Active', NULL, '2026-05-22 02:01:44'),
(6, 'Electrical', 'Wiring, breakers, outlets, lighting, and electrical fittings', 'Active', NULL, '2026-05-22 02:01:44'),
(7, 'Plumbing', 'Pipes, fittings, valves, and plumbing fixtures', 'Active', NULL, '2026-05-22 02:01:44'),
(8, 'Paint & Finishing', 'Paint, primer, brushes, rollers, and surface prep supplies', 'Active', NULL, '2026-05-22 02:01:44'),
(9, 'Heavy Equipment Parts', 'Spare parts and consumables for machinery and vehicles', 'Active', NULL, '2026-05-22 02:01:44'),
(10, 'Cleaning & Janitorial', 'Cleaning chemicals, mops, trash bags, and hygiene supplies', 'Active', NULL, '2026-05-22 02:01:44'),
(11, 'Furniture & Fixtures', 'Desks, chairs, cabinets, and office/site furniture', 'Active', NULL, '2026-05-22 02:01:44'),
(12, 'Packaging & Shipping', 'Boxes, pallets, tape, and shipping materials', 'Active', NULL, '2026-05-22 02:01:44');

-- --------------------------------------------------------

--
-- Table structure for table `disbursement_vouchers`
--

DROP TABLE IF EXISTS `disbursement_vouchers`;
CREATE TABLE IF NOT EXISTS `disbursement_vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dv_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: YYYY-MM-001 (incremental starting from 001)',
  `purchase_order_id` int DEFAULT NULL,
  `purchase_request_id` int DEFAULT NULL,
  `service_request_id` int DEFAULT NULL,
  `cash_request_id` int DEFAULT NULL,
  `payment_request_id` int DEFAULT NULL,
  `payment_order_id` int DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `prepared_by` int NOT NULL COMMENT 'Employee who created the DV',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Total amount from PO',
  `dv_date` date NOT NULL COMMENT 'Date when DV was created',
  `particulars` text COLLATE utf8mb4_unicode_ci COMMENT 'Payment particulars/description',
  `project` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pr_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Reference to PR number',
  `sr_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cr_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `po_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Check number when payment is processed',
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `received_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Person who received payment',
  `received_date` date DEFAULT NULL,
  `status` enum('Draft','Pending','Approved','Paid','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `certified_by_accounting` int DEFAULT NULL COMMENT 'Employee who certified availability of funds',
  `certified_by_manager` int DEFAULT NULL COMMENT 'General Manager who approved the DV',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `order_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dv_type` enum('po_based','sr_based','cash_based','pr_based','payment_order_based') COLLATE utf8mb4_unicode_ci DEFAULT 'po_based',
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
  KEY `fk_dv_payment_order` (`payment_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_layouts`
--

DROP TABLE IF EXISTS `document_layouts`;
CREATE TABLE IF NOT EXISTS `document_layouts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of document (purchase_request, purchase_order, payment_request, etc.)',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Display name for the layout',
  `layout_config` json NOT NULL COMMENT 'JSON configuration for the layout structure',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Whether this layout is currently active',
  `is_default` tinyint(1) DEFAULT '0' COMMENT 'Whether this is the default layout for the document type',
  `created_by` int DEFAULT NULL COMMENT 'ID of employee who created this layout',
  `updated_by` int DEFAULT NULL COMMENT 'ID of employee who last updated this layout',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `document_type` (`document_type`),
  KEY `is_active` (`is_active`),
  KEY `created_by` (`created_by`),
  KEY `document_layouts_updated_by_fk` (`updated_by`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
CREATE TABLE IF NOT EXISTS `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_no` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_initial` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('engineer','procurement','admin','super_admin') COLLATE utf8mb4_unicode_ci DEFAULT 'engineer',
  `department` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_no` (`employee_no`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_no`, `first_name`, `middle_initial`, `last_name`, `role`, `department`, `password`, `is_active`, `created_at`, `updated_at`) VALUES
(5, 'ENG-2026-0001', 'Michelle', 'T', 'Norial', 'engineer', 'Engineering', '$2a$10$g5BT/XyIWksZvK4LqqQTjuL/pjSglLqGdRQCGoPw375t5Q2g4XkKK', 1, '2026-02-10 02:36:33', '2026-06-08 07:29:05'),
(6, 'PRO-2026-0001', 'Junnel', 'B', 'Tadina', 'procurement', 'Procurement', '$2a$10$gqG3xZE0xaT/aA5BvUMpJeVQ3vbYoOoiqS2QP7HBC3XZwm.4qusQu', 1, '2026-02-10 02:36:33', '2026-08-12 07:10:20'),
(7, 'ADMIN-2026-0001', 'ELAINE', 'M', 'AGUILAR', 'admin', 'Administration', '$2a$10$gqG3xZE0xaT/aA5BvUMpJeVQ3vbYoOoiqS2QP7HBC3XZwm.4qusQu', 1, '2026-02-10 02:36:33', '2026-08-12 06:06:26'),
(8, 'SA-2026-004', 'Marc', 'J', 'Arzadon', 'super_admin', 'Management', '$2a$10$axW..03rjtzmDLOgyvn2ceyJResqKMyiyWQD7vYUa3gmTWvRqaENq', 1, '2026-02-10 02:36:33', '2026-04-14 01:20:11'),
(10, 'SA001', 'Super', 'D', 'Adminesu', 'super_admin', 'Management', '$2a$10$2VAa8J7EZDnfspG1/t4G1ez6MXGEnf3DLiPNqcJEm4ypE0p9RATNq', 1, '2026-02-12 00:55:00', '2026-02-12 02:48:05'),
(12, 'ENG-2026-0005', 'Joylene', 'F', 'Balanon', 'engineer', 'Engineering', '$2a$10$fFUgVn7r1fE8YPLnwcTDZOhWhEhjxY1gg3rULIps0uoMBVsBE95W.', 1, '2026-02-12 02:45:21', '2026-02-12 02:50:16'),
(13, 'ENG-2026-0006', 'Winnielyn Kaye', 'W', 'Olarte', 'engineer', 'Procurement', '$2a$10$.GDmwlv/XvEmPJzt3oIb0.39RVYiJMsxBwcTaMbmFInk3th76KpIu', 1, '2026-02-12 02:45:41', '2026-02-12 02:54:11'),
(14, 'ADMIN-2026-0002', 'RONALYN', 'W', 'MALLARE', 'admin', 'Administration', '$2a$10$zZXZI/tYRPS37ZQVDeThpeaBi5uCv1P1e1EsBkScqRmt/1.iZPFWK', 1, '2026-02-12 02:46:45', '2026-08-12 06:06:09'),
(16, 'ADMIN-2026-0004', 'MARJORIE', 'O', 'GARCIA', 'admin', 'Administration', '$2a$10$pj5HrIzaIYIkWlCbcOy9sOBNxrQitgV2.Umuh.wldfJWEYy5t0Ta6', 1, '2026-02-12 02:47:46', '2026-08-12 06:06:00');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
CREATE TABLE IF NOT EXISTS `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category_id` int DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_code` (`item_code`),
  UNIQUE KEY `item_name` (`item_name`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `item_code`, `item_name`, `description`, `category_id`, `unit`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(1, 'sdfgsdfg', 'sdfgsdg', 'sadgfs', 10, 'pcs', 8, 'Active', '2026-05-22 02:01:54', '2026-05-22 02:01:54'),
(2, 'asefsdfgdsg', 'dsfgdf', 'afrwfasdtgsdg', 10, 'set', 8, 'Active', '2026-05-22 02:02:38', '2026-05-22 02:02:38'),
(3, 'ITM001', 'Laptop Dell Latitude', 'Business laptop 15.6 inch', 1, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(4, 'ITM002', 'Wireless Mouse', 'USB wireless mouse', 1, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(5, 'ITM003', 'A4 Paper (Ream)', 'Premium quality A4 paper', 2, 'ream', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(6, 'ITM004', 'Ballpen Blue (Box)', 'Box of 12 blue ballpens', 2, 'box', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(7, 'ITM005', 'Safety Helmet', 'Hard hat for construction', 3, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(8, 'ITM006', 'Safety Vest Reflective', 'High-vis safety vest', 3, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(9, 'ITM007', 'Cordless Drill 18V', 'Cordless drill driver', 4, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(10, 'ITM008', 'Hammer Claw 16oz', 'Fiberglass handle hammer', 4, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(11, 'ITM009', 'Portland Cement 40kg', 'Type I cement bag', 5, 'bag', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(12, 'ITM010', 'Steel Rod 10mm', 'Deformed steel bar', 5, 'length', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(13, 'ITM011', 'THHN Wire 2.0mm', 'Electrical building wire roll', 6, 'roll', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(14, 'ITM012', 'Circuit Breaker 20A', 'Single pole breaker', 6, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(15, 'ITM013', 'PVC Pipe 2 inch', '6m Schedule 40 PVC pipe', 7, 'length', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(16, 'ITM014', 'Gate Valve 1 inch', 'Brass gate valve', 7, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(17, 'ITM015', 'Latex Paint White 4L', 'White latex paint', 8, 'gal', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(18, 'ITM016', 'Paint Roller 9 inch', 'Foam roller', 8, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(19, 'ITM017', 'Hydraulic Oil 46', '20L hydraulic fluid', 9, 'drum', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(20, 'ITM018', 'Floor Cleaner 5L', 'Industrial floor cleaner', 10, 'bottle', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(21, 'ITM019', 'Office Chair Ergonomic', 'Mesh office chair', 11, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(22, 'ITM020', 'Carton Box Medium', 'Corrugated shipping box', 12, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05'),
(23, 'SKU-023', 'junell tadina', 'xfdhfgh', 3, 'pcs', 5, 'Active', '2026-06-08 01:53:24', '2026-06-08 01:53:24'),
(24, 'SKU-024', 'Laminator', 'this is just for testing', 2, 'pcs', 7, 'Active', '2026-06-19 03:50:52', '2026-06-19 03:50:52');

-- --------------------------------------------------------

--
-- Table structure for table `layout_versions`
--

DROP TABLE IF EXISTS `layout_versions`;
CREATE TABLE IF NOT EXISTS `layout_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `layout_id` int NOT NULL COMMENT 'Reference to the parent layout',
  `version` int NOT NULL COMMENT 'Version number',
  `layout_config` json NOT NULL COMMENT 'JSON configuration for this version',
  `change_description` text COLLATE utf8mb4_unicode_ci COMMENT 'Description of changes made in this version',
  `created_by` int DEFAULT NULL COMMENT 'ID of employee who created this version',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_layout_version` (`layout_id`,`version`),
  KEY `layout_id` (`layout_id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'System',
  `related_id` int DEFAULT NULL COMMENT 'ID of related record (PR, PO, etc.)',
  `related_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Type of related record',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `recipient_id` (`recipient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=319 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_id`, `title`, `message`, `type`, `related_id`, `related_type`, `is_read`, `created_at`) VALUES
(219, 6, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 0, '2026-06-05 06:14:35'),
(220, 12, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 1, '2026-06-05 06:14:35'),
(221, 13, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 0, '2026-06-05 06:14:35'),
(222, 8, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 1, '2026-06-05 06:14:35'),
(223, 10, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 0, '2026-06-05 06:14:35'),
(224, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-06-001 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 36, 'purchase_request', 1, '2026-06-05 06:16:26'),
(225, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-06-001 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 36, 'purchase_request', 0, '2026-06-05 06:16:26'),
(226, 6, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 0, '2026-06-08 07:15:18'),
(227, 12, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 1, '2026-06-08 07:15:18'),
(228, 13, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 0, '2026-06-08 07:15:18'),
(229, 8, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 1, '2026-06-08 07:15:18'),
(230, 10, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 0, '2026-06-08 07:15:18'),
(231, 6, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 0, '2026-06-08 08:02:34'),
(232, 12, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 1, '2026-06-08 08:02:34'),
(233, 13, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 0, '2026-06-08 08:02:34'),
(234, 8, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 0, '2026-06-08 08:02:34'),
(235, 10, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 0, '2026-06-08 08:02:34'),
(236, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-06-003 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 38, 'purchase_request', 0, '2026-06-08 08:03:21'),
(237, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-06-003 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 38, 'purchase_request', 0, '2026-06-08 08:03:21'),
(238, 6, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 0, '2026-06-08 08:05:43'),
(239, 12, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 1, '2026-06-08 08:05:43'),
(240, 13, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 1, '2026-06-08 08:05:43'),
(241, 8, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 0, '2026-06-08 08:05:43'),
(242, 10, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 0, '2026-06-08 08:05:43'),
(243, 7, 'New PR Created', 'Purchase Request 2026-06-005 has been created and is ready for your review', 'PR Created', 40, 'purchase_request', 0, '2026-06-08 08:07:04'),
(244, 14, 'New PR Created', 'Purchase Request 2026-06-005 has been created and is ready for your review', 'PR Created', 40, 'purchase_request', 0, '2026-06-08 08:07:04'),
(245, 8, 'New PR Created', 'Purchase Request 2026-06-005 has been created and is ready for your review', 'PR Created', 40, 'purchase_request', 0, '2026-06-08 08:07:04'),
(246, 10, 'New PR Created', 'Purchase Request 2026-06-005 has been created and is ready for your review', 'PR Created', 40, 'purchase_request', 0, '2026-06-08 08:07:04'),
(247, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-06-005 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 40, 'purchase_request', 0, '2026-06-08 08:08:09'),
(248, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-06-005 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 40, 'purchase_request', 0, '2026-06-08 08:08:09'),
(249, 14, 'New PR Created', 'Purchase Request 2026-06-006 has been created and is ready for your review', 'PR Created', 41, 'purchase_request', 0, '2026-06-19 03:52:19'),
(250, 16, 'New PR Created', 'Purchase Request 2026-06-006 has been created and is ready for your review', 'PR Created', 41, 'purchase_request', 0, '2026-06-19 03:52:19'),
(251, 8, 'New PR Created', 'Purchase Request 2026-06-006 has been created and is ready for your review', 'PR Created', 41, 'purchase_request', 0, '2026-06-19 03:52:19'),
(252, 10, 'New PR Created', 'Purchase Request 2026-06-006 has been created and is ready for your review', 'PR Created', 41, 'purchase_request', 0, '2026-06-19 03:52:19'),
(253, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-06-006 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 41, 'purchase_request', 0, '2026-06-19 03:54:53'),
(254, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-06-006 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 41, 'purchase_request', 0, '2026-06-19 03:54:53'),
(255, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-08-007 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 42, 'purchase_request', 0, '2026-08-12 02:44:30'),
(256, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-08-007 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 42, 'purchase_request', 0, '2026-08-12 02:44:30'),
(257, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:19'),
(258, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:19'),
(259, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:19'),
(260, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:41'),
(261, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:41'),
(262, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:41'),
(263, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:50'),
(264, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:50'),
(265, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:50'),
(266, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-08-008 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:58'),
(267, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-08-008 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:58'),
(268, 6, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(269, 12, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(270, 13, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(271, 7, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(272, 14, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(273, 16, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(274, 8, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(275, 10, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(276, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:45:44'),
(277, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:45:44'),
(278, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:45:44'),
(279, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:10'),
(280, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:10'),
(281, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:10'),
(282, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:18'),
(283, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:18'),
(284, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:18'),
(285, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-08-009 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:26'),
(286, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-08-009 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:26'),
(287, 6, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(288, 12, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(289, 13, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(290, 7, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(291, 14, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(292, 16, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(293, 8, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(294, 10, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(295, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-010 has been reviewed by engineers and is ready for admin review', 'PR Review', 45, 'purchase_request', 0, '2026-08-12 06:57:39'),
(296, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-010 has been reviewed by engineers and is ready for admin review', 'PR Review', 45, 'purchase_request', 0, '2026-08-12 06:57:39'),
(297, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-010 has been reviewed by engineers and is ready for admin review', 'PR Review', 45, 'purchase_request', 0, '2026-08-12 06:57:39'),
(298, 12, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(299, 13, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(300, 7, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(301, 14, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(302, 16, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(303, 6, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(304, 8, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(305, 10, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(306, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:14'),
(307, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:14'),
(308, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:14'),
(309, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:26'),
(310, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:26'),
(311, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:26'),
(312, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:33'),
(313, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:33'),
(314, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:33'),
(315, 6, 'PR Ready for Procurement Review', 'Purchase Request 2026-08-011 has been reviewed by admins and is ready for procurement review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:42'),
(316, 8, 'PR Pending Final Approval', 'Purchase Request 2026-08-011 has been reviewed by Procurement and requires your final approval', 'PR Approved', 46, 'purchase_request', 0, '2026-08-12 07:15:18'),
(317, 10, 'PR Pending Final Approval', 'Purchase Request 2026-08-011 has been reviewed by Procurement and requires your final approval', 'PR Approved', 46, 'purchase_request', 0, '2026-08-12 07:15:18'),
(318, 5, 'PR Values Modified by Procurement', 'Procurement modified values in your PR 2026-08-011: Circuit Breaker 20A: unit price from ₱23.00 to ₱23, unit from \"null\" to \"pcs\"', 'PR Modified', 46, 'purchase_request', 0, '2026-08-12 07:15:18');

-- --------------------------------------------------------

--
-- Table structure for table `order_number_budgets`
--

DROP TABLE IF EXISTS `order_number_budgets`;
CREATE TABLE IF NOT EXISTS `order_number_budgets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `planned_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_order_project` (`order_number`,`project`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_number_locks`
--

DROP TABLE IF EXISTS `order_number_locks`;
CREATE TABLE IF NOT EXISTS `order_number_locks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `locked_by` int NOT NULL,
  `locked_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_order_number_lock` (`order_number`),
  KEY `idx_locked_by` (`locked_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_orders`
--

DROP TABLE IF EXISTS `payment_orders`;
CREATE TABLE IF NOT EXISTS `payment_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `service_request_id` int DEFAULT NULL,
  `cash_request_id` int DEFAULT NULL,
  `payee_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `payee_address` text COLLATE utf8mb4_general_ci,
  `purpose` text COLLATE utf8mb4_general_ci,
  `project` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `project_address` text COLLATE utf8mb4_general_ci,
  `order_number` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('Draft','Pending','For Admin Approval','For Super Admin Final Approval','Approved','PO Created','DV Created','On Hold','Rejected') COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `remarks` text COLLATE utf8mb4_general_ci,
  `requested_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_number` (`po_number`),
  KEY `requested_by` (`requested_by`),
  KEY `idx_po_status` (`status`),
  KEY `idx_po_service_request_id` (`service_request_id`),
  KEY `fk_po_cash_request` (`cash_request_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_requests`
--

DROP TABLE IF EXISTS `payment_requests`;
CREATE TABLE IF NOT EXISTS `payment_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pr_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_request_id` int DEFAULT NULL,
  `service_request_id` int DEFAULT NULL,
  `payee_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Person/entity to pay',
  `payee_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `project` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_basis` enum('debt','non_debt') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'non_debt',
  `requested_by` int NOT NULL,
  `status` enum('Draft','Pending','For Approval','On Hold','Approved','Rejected','Cancelled','DV Created','Paid') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `dv_id` int DEFAULT NULL COMMENT 'Reference to Disbursement Voucher when created',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pr_number` (`pr_number`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  KEY `status` (`status`),
  KEY `dv_id` (`dv_id`),
  KEY `idx_service_request_id` (`service_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_request_items`
--

DROP TABLE IF EXISTS `payment_request_items`;
CREATE TABLE IF NOT EXISTS `payment_request_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_request_id` int NOT NULL,
  `pr_item_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT '0.00',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pcs',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payment_request_id` (`payment_request_id`),
  KEY `pr_item_id` (`pr_item_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_schedule_reminder_logs`
--

DROP TABLE IF EXISTS `payment_schedule_reminder_logs`;
CREATE TABLE IF NOT EXISTS `payment_schedule_reminder_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `reminder_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_schedule_reminder` (`schedule_id`,`reminder_type`),
  KEY `idx_psrl_type_sent_at` (`reminder_type`,`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `po_attachments`
--

DROP TABLE IF EXISTS `po_attachments`;
CREATE TABLE IF NOT EXISTS `po_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Relative path to file storage',
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Original file name',
  `file_size` int DEFAULT NULL COMMENT 'File size in bytes',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` int NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pricing_history`
--

DROP TABLE IF EXISTS `pricing_history`;
CREATE TABLE IF NOT EXISTS `pricing_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `purchase_order_id` int DEFAULT NULL,
  `purchase_request_id` int DEFAULT NULL,
  `po_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pr_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_recorded` date NOT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_pricing_pr` (`purchase_request_id`),
  KEY `fk_pricing_created_by` (`created_by`),
  KEY `idx_pricing_item_id` (`item_id`),
  KEY `idx_pricing_supplier_id` (`supplier_id`),
  KEY `idx_pricing_date` (`date_recorded`),
  KEY `idx_pricing_po` (`purchase_order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=166 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pricing_history`
--

INSERT INTO `pricing_history` (`id`, `item_id`, `supplier_id`, `unit_price`, `quantity`, `total_amount`, `purchase_order_id`, `purchase_request_id`, `po_number`, `pr_number`, `date_recorded`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(28, 1, 1, 250.00, 100.00, 25000.00, NULL, NULL, NULL, NULL, '2025-01-15', 'Bulk purchase for Project Alpha', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(29, 1, 1, 255.00, 50.00, 12750.00, NULL, NULL, NULL, NULL, '2025-02-20', 'Additional order', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(30, 1, 2, 248.00, 100.00, 24800.00, NULL, NULL, NULL, NULL, '2025-03-10', 'New supplier trial', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(31, 1, 1, 260.00, 75.00, 19500.00, NULL, NULL, NULL, NULL, '2025-04-05', 'Price increase due to demand', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(32, 2, 3, 450.00, 200.00, 90000.00, NULL, NULL, NULL, NULL, '2025-01-10', 'Construction materials', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(33, 2, 3, 445.00, 150.00, 66750.00, NULL, NULL, NULL, NULL, '2025-02-15', 'Negotiated discount', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(34, 2, 1, 455.00, 100.00, 45500.00, NULL, NULL, NULL, NULL, '2025-03-20', 'Emergency restock', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(35, 3, 2, 850.00, 10.00, 8500.00, NULL, NULL, NULL, NULL, '2025-01-20', 'Truck load delivery', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(36, 3, 2, 820.00, 15.00, 12300.00, NULL, NULL, NULL, NULL, '2025-02-25', 'Volume discount applied', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(37, 3, 4, 875.00, 8.00, 7000.00, NULL, NULL, NULL, NULL, '2025-03-15', 'Alternative supplier', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(38, 4, 2, 750.00, 12.00, 9000.00, NULL, NULL, NULL, NULL, '2025-01-25', 'Foundation work', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(39, 4, 2, 740.00, 20.00, 14800.00, NULL, NULL, NULL, NULL, '2025-03-05', 'Large project order', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(40, 5, 4, 1200.00, 25.00, 30000.00, NULL, NULL, NULL, NULL, '2025-02-01', 'Interior painting project', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(41, 5, 4, 1150.00, 30.00, 34500.00, NULL, NULL, NULL, NULL, '2025-03-25', 'Bulk discount negotiated', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(42, 5, 1, 1250.00, 10.00, 12500.00, NULL, NULL, NULL, NULL, '2025-04-10', 'Premium grade paint', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(43, 6, 3, 45.00, 500.00, 22500.00, NULL, NULL, NULL, NULL, '2025-02-10', 'Wiring for new building', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(44, 6, 3, 42.00, 1000.00, 42000.00, NULL, NULL, NULL, NULL, '2025-03-30', 'Large scale project', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(45, 7, 2, 180.00, 50.00, 9000.00, NULL, NULL, NULL, NULL, '2025-01-30', 'Plumbing installation', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(46, 7, 4, 175.00, 75.00, 13125.00, NULL, NULL, NULL, NULL, '2025-03-12', 'Better pricing found', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(47, 7, 2, 185.00, 40.00, 7400.00, NULL, NULL, NULL, NULL, '2025-04-08', 'Quality preferred over price', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(48, 8, 1, 35.00, 1000.00, 35000.00, NULL, NULL, NULL, NULL, '2025-02-20', 'Complete roof replacement', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(49, 8, 1, 33.00, 500.00, 16500.00, NULL, NULL, NULL, NULL, '2025-04-01', 'Loyalty discount', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(50, 9, 4, 2500.00, 20.00, 50000.00, NULL, NULL, NULL, NULL, '2025-03-01', 'Office building windows', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(51, 9, 3, 2450.00, 15.00, 36750.00, NULL, NULL, NULL, NULL, '2025-04-15', 'Competitive bid', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(52, 10, 1, 650.00, 100.00, 65000.00, NULL, NULL, NULL, NULL, '2025-01-05', 'Framing materials', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(53, 10, 1, 625.00, 150.00, 93750.00, NULL, NULL, NULL, NULL, '2025-02-28', 'Volume discount', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(54, 10, 2, 640.00, 80.00, 51200.00, NULL, NULL, NULL, NULL, '2025-04-20', 'Alternative source', NULL, '2026-03-06 07:44:53', '2026-03-06 07:44:53'),
(55, 1, 1, 245.00, 100.00, 24500.00, NULL, NULL, NULL, NULL, '2025-01-15', 'January bulk order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(56, 1, 1, 248.00, 80.00, 19840.00, NULL, NULL, NULL, NULL, '2025-02-10', 'February order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(57, 1, 1, 255.00, 120.00, 30600.00, NULL, NULL, NULL, NULL, '2025-03-20', 'March - price increase', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(58, 1, 1, 252.00, 90.00, 22680.00, NULL, NULL, NULL, NULL, '2025-04-12', 'April order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(59, 1, 1, 260.00, 100.00, 26000.00, NULL, NULL, NULL, NULL, '2025-05-15', 'May - peak season pricing', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(60, 1, 1, 258.00, 110.00, 28380.00, NULL, NULL, NULL, NULL, '2025-06-18', 'June order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(61, 1, 1, 265.00, 95.00, 25175.00, NULL, NULL, NULL, NULL, '2025-07-22', 'July - high demand', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(62, 1, 1, 262.00, 85.00, 22270.00, NULL, NULL, NULL, NULL, '2025-08-14', 'August order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(63, 1, 1, 255.00, 100.00, 25500.00, NULL, NULL, NULL, NULL, '2025-09-16', 'September - price drop', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(64, 1, 1, 250.00, 120.00, 30000.00, NULL, NULL, NULL, NULL, '2025-10-20', 'October bulk order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(65, 1, 1, 248.00, 90.00, 22320.00, NULL, NULL, NULL, NULL, '2025-11-15', 'November order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(66, 1, 1, 252.00, 100.00, 25200.00, NULL, NULL, NULL, NULL, '2025-12-10', 'December year-end order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(67, 1, 2, 242.00, 50.00, 12100.00, NULL, NULL, NULL, NULL, '2025-01-20', 'Jan - Supplier 2 trial', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(68, 1, 2, 245.00, 60.00, 14700.00, NULL, NULL, NULL, NULL, '2025-03-05', 'Mar - Supplier 2', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(69, 1, 2, 250.00, 70.00, 17500.00, NULL, NULL, NULL, NULL, '2025-05-08', 'May - Supplier 2', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(70, 1, 2, 248.00, 55.00, 13640.00, NULL, NULL, NULL, NULL, '2025-07-12', 'Jul - Supplier 2', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(71, 1, 2, 245.00, 80.00, 19600.00, NULL, NULL, NULL, NULL, '2025-09-20', 'Sep - Supplier 2', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(72, 1, 2, 240.00, 65.00, 15600.00, NULL, NULL, NULL, NULL, '2025-11-25', 'Nov - Supplier 2 discount', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(73, 2, 3, 440.00, 150.00, 66000.00, NULL, NULL, NULL, NULL, '2025-01-10', 'January steel order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(74, 2, 3, 445.00, 120.00, 53400.00, NULL, NULL, NULL, NULL, '2025-02-15', 'February steel', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(75, 2, 3, 450.00, 180.00, 81000.00, NULL, NULL, NULL, NULL, '2025-03-25', 'March steel - price up', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(76, 2, 3, 455.00, 140.00, 63700.00, NULL, NULL, NULL, NULL, '2025-04-18', 'April steel', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(77, 2, 3, 460.00, 160.00, 73600.00, NULL, NULL, NULL, NULL, '2025-05-22', 'May steel - peak pricing', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(78, 2, 3, 458.00, 130.00, 59540.00, NULL, NULL, NULL, NULL, '2025-06-14', 'June steel', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(79, 2, 3, 465.00, 170.00, 79050.00, NULL, NULL, NULL, NULL, '2025-07-28', 'July steel - high demand', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(80, 2, 3, 462.00, 145.00, 66990.00, NULL, NULL, NULL, NULL, '2025-08-16', 'August steel', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(81, 2, 3, 455.00, 155.00, 70525.00, NULL, NULL, NULL, NULL, '2025-09-24', 'September steel - slight drop', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(82, 2, 3, 450.00, 175.00, 78750.00, NULL, NULL, NULL, NULL, '2025-10-30', 'October steel', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(83, 2, 3, 448.00, 140.00, 62720.00, NULL, NULL, NULL, NULL, '2025-11-20', 'November steel', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(84, 2, 3, 452.00, 160.00, 72320.00, NULL, NULL, NULL, NULL, '2025-12-15', 'December steel', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(85, 5, 4, 1150.00, 20.00, 23000.00, NULL, NULL, NULL, NULL, '2025-01-08', 'January paint order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(86, 5, 4, 1180.00, 25.00, 29500.00, NULL, NULL, NULL, NULL, '2025-02-14', 'February paint', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(87, 5, 4, 1200.00, 30.00, 36000.00, NULL, NULL, NULL, NULL, '2025-03-22', 'March paint - spring projects', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(88, 5, 4, 1220.00, 35.00, 42700.00, NULL, NULL, NULL, NULL, '2025-04-28', 'April paint - high season', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(89, 5, 4, 1250.00, 40.00, 50000.00, NULL, NULL, NULL, NULL, '2025-05-30', 'May paint - peak season', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(90, 5, 4, 1240.00, 32.00, 39680.00, NULL, NULL, NULL, NULL, '2025-06-18', 'June paint', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(91, 5, 4, 1220.00, 28.00, 34160.00, NULL, NULL, NULL, NULL, '2025-07-25', 'July paint', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(92, 5, 4, 1200.00, 30.00, 36000.00, NULL, NULL, NULL, NULL, '2025-08-20', 'August paint', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(93, 5, 4, 1180.00, 35.00, 41300.00, NULL, NULL, NULL, NULL, '2025-09-26', 'September paint', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(94, 5, 4, 1150.00, 42.00, 48300.00, NULL, NULL, NULL, NULL, '2025-10-15', 'October paint - bulk order', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(95, 5, 4, 1120.00, 38.00, 42560.00, NULL, NULL, NULL, NULL, '2025-11-22', 'November paint - discount', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(96, 5, 4, 1100.00, 45.00, 49500.00, NULL, NULL, NULL, NULL, '2025-12-18', 'December paint - year end sale', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(97, 10, 1, 620.00, 80.00, 49600.00, NULL, NULL, NULL, NULL, '2025-01-12', 'January lumber', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(98, 10, 1, 635.00, 75.00, 47625.00, NULL, NULL, NULL, NULL, '2025-02-18', 'February lumber', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(99, 10, 1, 650.00, 90.00, 58500.00, NULL, NULL, NULL, NULL, '2025-03-24', 'March lumber', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(100, 10, 1, 665.00, 85.00, 56525.00, NULL, NULL, NULL, NULL, '2025-04-16', 'April lumber - price up', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(101, 10, 1, 680.00, 95.00, 64600.00, NULL, NULL, NULL, NULL, '2025-05-28', 'May lumber - peak price', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(102, 10, 1, 675.00, 88.00, 59400.00, NULL, NULL, NULL, NULL, '2025-06-22', 'June lumber', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(103, 10, 1, 660.00, 82.00, 54120.00, NULL, NULL, NULL, NULL, '2025-07-19', 'July lumber - slight drop', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(104, 10, 1, 655.00, 78.00, 51090.00, NULL, NULL, NULL, NULL, '2025-08-25', 'August lumber', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(105, 10, 1, 645.00, 85.00, 54825.00, NULL, NULL, NULL, NULL, '2025-09-17', 'September lumber', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(106, 10, 1, 640.00, 92.00, 58880.00, NULL, NULL, NULL, NULL, '2025-10-24', 'October lumber', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(107, 10, 1, 630.00, 87.00, 54810.00, NULL, NULL, NULL, NULL, '2025-11-21', 'November lumber', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(108, 10, 1, 625.00, 95.00, 59375.00, NULL, NULL, NULL, NULL, '2025-12-16', 'December lumber', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(109, 6, 3, 42.00, 400.00, 16800.00, NULL, NULL, NULL, NULL, '2025-01-25', 'January wire', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(110, 6, 3, 43.00, 380.00, 16340.00, NULL, NULL, NULL, NULL, '2025-02-20', 'February wire', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(111, 6, 3, 44.00, 420.00, 18480.00, NULL, NULL, NULL, NULL, '2025-03-28', 'March wire', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(112, 6, 3, 45.00, 450.00, 20250.00, NULL, NULL, NULL, NULL, '2025-04-22', 'April wire', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(113, 6, 3, 46.00, 480.00, 22080.00, NULL, NULL, NULL, NULL, '2025-05-18', 'May wire', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(114, 6, 3, 45.50, 460.00, 20930.00, NULL, NULL, NULL, NULL, '2025-06-24', 'June wire', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(115, 6, 3, 44.00, 440.00, 19360.00, NULL, NULL, NULL, NULL, '2025-07-30', 'July wire - price drop', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(116, 6, 3, 43.50, 470.00, 20445.00, NULL, NULL, NULL, NULL, '2025-08-26', 'August wire', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(117, 6, 3, 42.00, 500.00, 21000.00, NULL, NULL, NULL, NULL, '2025-09-21', 'September wire - bulk', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(118, 6, 3, 41.00, 520.00, 21320.00, NULL, NULL, NULL, NULL, '2025-10-27', 'October wire - discount', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(119, 6, 3, 40.50, 480.00, 19440.00, NULL, NULL, NULL, NULL, '2025-11-19', 'November wire', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(120, 6, 3, 41.00, 550.00, 22550.00, NULL, NULL, NULL, NULL, '2025-12-28', 'December wire - year end stock', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(121, 7, 2, 175.00, 60.00, 10500.00, NULL, NULL, NULL, NULL, '2025-01-30', 'January pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(122, 7, 2, 178.00, 55.00, 9790.00, NULL, NULL, NULL, NULL, '2025-02-25', 'February pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(123, 7, 2, 180.00, 70.00, 12600.00, NULL, NULL, NULL, NULL, '2025-03-20', 'March pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(124, 7, 2, 182.00, 65.00, 11830.00, NULL, NULL, NULL, NULL, '2025-04-28', 'April pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(125, 7, 2, 185.00, 80.00, 14800.00, NULL, NULL, NULL, NULL, '2025-05-26', 'May pipes - peak season', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(126, 7, 2, 183.00, 72.00, 13176.00, NULL, NULL, NULL, NULL, '2025-06-22', 'June pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(127, 7, 2, 180.00, 68.00, 12240.00, NULL, NULL, NULL, NULL, '2025-07-18', 'July pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(128, 7, 2, 178.00, 75.00, 13350.00, NULL, NULL, NULL, NULL, '2025-08-24', 'August pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(129, 7, 2, 176.00, 62.00, 10912.00, NULL, NULL, NULL, NULL, '2025-09-29', 'September pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(130, 7, 2, 174.00, 85.00, 14790.00, NULL, NULL, NULL, NULL, '2025-10-31', 'October pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(131, 7, 2, 172.00, 78.00, 13416.00, NULL, NULL, NULL, NULL, '2025-11-23', 'November pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(132, 7, 2, 175.00, 90.00, 15750.00, NULL, NULL, NULL, NULL, '2025-12-19', 'December pipes', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(133, 8, 1, 32.00, 800.00, 25600.00, NULL, NULL, NULL, NULL, '2025-01-15', 'January tiles', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(134, 8, 1, 33.00, 750.00, 24750.00, NULL, NULL, NULL, NULL, '2025-02-28', 'February tiles', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(135, 8, 1, 34.00, 900.00, 30600.00, NULL, NULL, NULL, NULL, '2025-03-25', 'March tiles - pre-season', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(136, 8, 1, 35.00, 1000.00, 35000.00, NULL, NULL, NULL, NULL, '2025-04-30', 'April tiles - construction season', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(137, 8, 1, 36.00, 1200.00, 43200.00, NULL, NULL, NULL, NULL, '2025-05-28', 'May tiles - peak season', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(138, 8, 1, 36.50, 1100.00, 40150.00, NULL, NULL, NULL, NULL, '2025-06-26', 'June tiles', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(139, 8, 1, 35.50, 1050.00, 37275.00, NULL, NULL, NULL, NULL, '2025-07-24', 'July tiles', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(140, 8, 1, 34.50, 950.00, 32775.00, NULL, NULL, NULL, NULL, '2025-08-22', 'August tiles', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(141, 8, 1, 34.00, 880.00, 29920.00, NULL, NULL, NULL, NULL, '2025-09-20', 'September tiles', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(142, 8, 1, 33.00, 920.00, 30360.00, NULL, NULL, NULL, NULL, '2025-10-18', 'October tiles', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(143, 8, 1, 32.50, 850.00, 27625.00, NULL, NULL, NULL, NULL, '2025-11-16', 'November tiles', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(144, 8, 1, 33.00, 780.00, 25740.00, NULL, NULL, NULL, NULL, '2025-12-14', 'December tiles', NULL, '2026-03-06 07:52:03', '2026-03-06 07:52:03'),
(145, 2, 4, 0.21, 1.00, 0.21, 15, 32, 'ETN-2026-03-001', 'MTN-2026-03-001', '2026-03-10', 'Auto-recorded from PO ETN-2026-03-001', NULL, '2026-03-10 02:20:27', '2026-03-10 02:20:27'),
(146, 6, 4, 320.00, 1.00, 320.00, 15, 32, 'ETN-2026-03-001', 'MTN-2026-03-001', '2026-03-10', 'Auto-recorded from PO ETN-2026-03-001', NULL, '2026-03-10 02:20:27', '2026-03-10 02:20:27'),
(147, 2, 2, 34.00, 3432.00, 116688.00, 16, 34, 'ETN-2026-03-002', 'EMT-2026-03-001', '2026-03-10', 'Auto-recorded from PO ETN-2026-03-002', NULL, '2026-03-10 02:35:35', '2026-03-10 02:35:35'),
(148, 6, 2, 45.00, 121.00, 5445.00, 16, 34, 'ETN-2026-03-002', 'EMT-2026-03-001', '2026-03-10', 'Auto-recorded from PO ETN-2026-03-002', NULL, '2026-03-10 02:35:35', '2026-03-10 02:35:35'),
(149, 2, 3, 43.00, 1.00, 43.00, 17, 35, 'ETN-2026-03-003', 'WWO-2026-03-001', '2026-03-10', 'Auto-recorded from PO ETN-2026-03-003', NULL, '2026-03-10 06:08:35', '2026-03-10 06:08:35'),
(150, 6, 3, 78.00, 1.00, 78.00, 17, 35, 'ETN-2026-03-003', 'WWO-2026-03-001', '2026-03-10', 'Auto-recorded from PO ETN-2026-03-003', NULL, '2026-03-10 06:08:35', '2026-03-10 06:08:35'),
(151, 173, 4, 100000.00, 1.00, 100000.00, 22, 48, 'ETN-2026-04-001', 'JBT-2026-04-002', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-001', NULL, '2026-04-13 01:54:41', '2026-04-13 01:54:41'),
(152, 173, 4, 100.00, 1.00, 100.00, 23, 49, 'ETN-2026-04-002', 'JBT-2026-04-003', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-002', NULL, '2026-04-13 02:26:16', '2026-04-13 02:26:16'),
(153, 173, 2, 3000.00, 1.00, 3000.00, 24, 51, 'ETN-2026-04-003', 'EMT-2026-04-002', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-003', NULL, '2026-04-13 03:50:34', '2026-04-13 03:50:34'),
(154, 282, 2, 3000.00, 1.00, 3000.00, 24, 51, 'ETN-2026-04-003', 'EMT-2026-04-002', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-003', NULL, '2026-04-13 03:50:34', '2026-04-13 03:50:34'),
(155, 173, 2, 3000.00, 1.00, 3000.00, 25, 52, 'ETN-2026-04-001', 'EMT-2026-04-001', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-001', NULL, '2026-04-13 05:11:27', '2026-04-13 05:11:27'),
(156, 173, 2, 3000.00, 1.00, 3000.00, 28, 52, 'ETN-2026-04-001', 'EMT-2026-04-001', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-001', NULL, '2026-04-13 05:27:43', '2026-04-13 05:27:43'),
(157, 173, 2, 3000.00, 1.00, 3000.00, 31, 52, 'ETN-2026-04-001', 'EMT-2026-04-001', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-001', NULL, '2026-04-13 05:47:09', '2026-04-13 05:47:09'),
(158, 173, 4, 300.00, 1.00, 300.00, 32, 53, 'ETN-2026-04-001', 'EMT-2026-04-001', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-001', NULL, '2026-04-13 07:08:24', '2026-04-13 07:08:24'),
(159, 282, 4, 340.00, 1.00, 340.00, 32, 53, 'ETN-2026-04-001', 'EMT-2026-04-001', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-001', NULL, '2026-04-13 07:08:24', '2026-04-13 07:08:24'),
(160, 290, 4, 560.00, 1.00, 560.00, 32, 53, 'ETN-2026-04-001', 'EMT-2026-04-001', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-001', NULL, '2026-04-13 07:08:24', '2026-04-13 07:08:24'),
(161, 173, 2, 1000.00, 1.00, 1000.00, 33, 54, 'ETN-2026-04-002', 'EMT-2026-04-002', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-002', NULL, '2026-04-13 07:51:37', '2026-04-13 07:51:37'),
(162, 282, 2, 1000.00, 1.00, 1000.00, 33, 54, 'ETN-2026-04-002', 'EMT-2026-04-002', '2026-04-13', 'Auto-recorded from PO ETN-2026-04-002', NULL, '2026-04-13 07:51:37', '2026-04-13 07:51:37'),
(163, 173, 4, 500.00, 1.00, 500.00, 34, 55, 'ETN-2026-04-003', 'MTN-2026-04-001', '2026-04-14', 'Auto-recorded from PO ETN-2026-04-003', NULL, '2026-04-14 01:49:26', '2026-04-14 01:49:26'),
(164, 282, 4, 1000.00, 1.00, 1000.00, 34, 55, 'ETN-2026-04-003', 'MTN-2026-04-001', '2026-04-14', 'Auto-recorded from PO ETN-2026-04-003', NULL, '2026-04-14 01:49:26', '2026-04-14 01:49:26'),
(165, 173, 4, 1000.00, 1.00, 1000.00, 35, 69, 'ETN-2026-04-001', 'MTN-2026-04-001', '2026-04-16', 'Auto-recorded from PO ETN-2026-04-001', NULL, '2026-04-16 05:27:43', '2026-04-16 05:27:43');

-- --------------------------------------------------------

--
-- Table structure for table `pr_item_rejection_remarks`
--

DROP TABLE IF EXISTS `pr_item_rejection_remarks`;
CREATE TABLE IF NOT EXISTS `pr_item_rejection_remarks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_request_id` int NOT NULL,
  `purchase_request_item_id` int NOT NULL,
  `item_id` int NOT NULL,
  `remark` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `purchase_request_item_id` (`purchase_request_item_id`),
  KEY `item_id` (`item_id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_request_id` int DEFAULT NULL,
  `service_request_id` int DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `prepared_by` int NOT NULL,
  `total_amount` decimal(10,2) DEFAULT '0.00',
  `po_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `status` enum('Draft','Pending Approval','Approved','On Hold','Delivered','Paid','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `place_of_delivery` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_term` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'COD',
  `payment_term` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'CASH',
  `project` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `order_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `po_type` enum('purchase_order','payment_order') COLLATE utf8mb4_unicode_ci DEFAULT 'purchase_order' COMMENT 'Type of PO: purchase_order (debt) or payment_order (non-debt/prepaid)',
  `parent_po_id` int DEFAULT NULL,
  `installment_schedule_id` int DEFAULT NULL,
  `scheduled_payment_date` date DEFAULT NULL,
  `scheduled_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_number` (`po_number`),
  UNIQUE KEY `uq_po_installment` (`parent_po_id`,`installment_schedule_id`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `prepared_by` (`prepared_by`),
  KEY `po_type` (`po_type`),
  KEY `service_request_id` (`service_request_id`),
  KEY `idx_po_type` (`po_type`),
  KEY `idx_po_parent_po_id` (`parent_po_id`),
  KEY `idx_po_installment_schedule_id` (`installment_schedule_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `po_number`, `purchase_request_id`, `service_request_id`, `supplier_id`, `prepared_by`, `total_amount`, `po_date`, `expected_delivery_date`, `actual_delivery_date`, `status`, `created_at`, `updated_at`, `place_of_delivery`, `delivery_term`, `payment_term`, `project`, `notes`, `order_number`, `po_type`, `parent_po_id`, `installment_schedule_id`, `scheduled_payment_date`, `scheduled_amount`) VALUES
(1, 'PO-2026-0001', 1, NULL, 10, 2, 75250.00, '2026-05-22', '2026-05-29', NULL, 'Approved', '2026-05-22 02:41:53', '2026-05-29 01:45:51', 'Main Warehouse, Site A', 'COD', 'CASH', 'Project Alpha Phase 1', 'Standard mock order for system testing and procurement validation.', 'ORD-99541', 'purchase_order', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

DROP TABLE IF EXISTS `purchase_order_items`;
CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int NOT NULL,
  `purchase_request_item_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `purchase_request_item_id` (`purchase_request_item_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `purchase_order_items`
--
DROP TRIGGER IF EXISTS `trg_record_pricing_history_after_po_item_insert`;
DELIMITER $$
CREATE TRIGGER `trg_record_pricing_history_after_po_item_insert` AFTER INSERT ON `purchase_order_items` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_requests`
--

DROP TABLE IF EXISTS `purchase_requests`;
CREATE TABLE IF NOT EXISTS `purchase_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pr_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_by` int DEFAULT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `date_needed` date DEFAULT NULL,
  `project` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Draft','Pending','For Procurement Review','For Engineer Review','For Admin Review','For Super Admin Final Approval','On Hold','For Purchase','PO Created','Payment Request Created','Completed','Rejected','Cancelled','Received','Pending Accreditation Review') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `supplier_id` int DEFAULT NULL,
  `supplier_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_basis` enum('debt','non_debt') COLLATE utf8mb4_unicode_ci DEFAULT 'debt' COMMENT 'Determines if PR leads to Purchase Order (debt) or Payment Order (non_debt)',
  `payment_terms_code` enum('CASH','COD','NET_7','NET_15','NET_30','CUSTOM') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms_note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms_set_by` int DEFAULT NULL,
  `payment_terms_set_at` timestamp NULL DEFAULT NULL,
  `supplier_name` varchar(111) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accreditation_files` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of accreditation file paths uploaded by requester',
  `supplier_accredited` tinyint(1) DEFAULT NULL COMMENT '1 if supplier was accredited at time of PR creation, 0 if not, NULL if unknown',
  PRIMARY KEY (`id`),
  UNIQUE KEY `pr_number` (`pr_number`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  KEY `supplier_id` (`supplier_id`),
  KEY `payment_basis` (`payment_basis`),
  KEY `purchase_requests_payment_terms_set_by_fk` (`payment_terms_set_by`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_requests`
--

INSERT INTO `purchase_requests` (`id`, `pr_number`, `requested_by`, `purpose`, `remarks`, `date_needed`, `project`, `project_address`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `total_amount`, `created_at`, `updated_at`, `supplier_id`, `supplier_address`, `order_number`, `payment_basis`, `payment_terms_code`, `payment_terms_note`, `payment_terms_set_by`, `payment_terms_set_at`, `supplier_name`, `accreditation_files`, `supplier_accredited`) VALUES
(36, '2026-06-001', 5, 'hsfdfg fgh', NULL, '2026-06-12', 'Sto. Rosario', 'Sto. Rosario, San Juan, La Union', 'For Purchase', 8, '2026-06-05 06:16:40', NULL, 396.00, '2026-06-05 06:14:35', '2026-06-05 06:16:40', NULL, 'fd', '299269388', 'non_debt', NULL, NULL, NULL, NULL, 'fh', '[{\"filename\":\"accreditation_files-1780640075481-727453544.xlsx\",\"originalname\":\"PR-2026-06-023.xlsx\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1780640075481-727453544.xlsx\",\"size\":52165,\"mimetype\":\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\",\"uploaded_at\":\"2026-06-05T06:14:35.937Z\"}]', 0),
(37, '2026-06-002', 5, 'eg', 'sdg', '2026-06-25', 'BCDA - CCTV', 'Poro point, San Fernando City, La Union', 'For Engineer Review', NULL, NULL, NULL, 23.00, '2026-06-08 07:15:18', '2026-06-08 07:53:51', NULL, 'sdf', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'asdfa', '[{\"filename\":\"accreditation_files-1780902918265-169464164.jpg\",\"originalname\":\"710117906_1309349294660437_8264004531172843646_n.jpg\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1780902918265-169464164.jpg\",\"size\":247968,\"mimetype\":\"image/jpeg\",\"uploaded_at\":\"2026-06-08T07:15:18.271Z\"}]', 0),
(38, '2026-06-003', 5, 'qwgwertgsergs', NULL, '2026-07-03', 'BCDA - CCA', 'Poro point, San Fernando City, La Union', 'For Purchase', 8, '2026-06-19 03:55:19', NULL, 21.00, '2026-06-08 08:02:34', '2026-06-19 03:55:19', NULL, 'sdfgsdg', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'sdsdfgsdfg', '[{\"filename\":\"accreditation_files-1780905754493-237260569.pdf\",\"originalname\":\"RESUME._103654.pdf\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1780905754493-237260569.pdf\",\"size\":596275,\"mimetype\":\"application/pdf\",\"uploaded_at\":\"2026-06-08T08:02:34.501Z\"}]', 0),
(39, '2026-06-004', 5, 'wertwetwet', 'teyteh', '2026-07-11', 'BCDA - Control Tower', 'Poro point, San Fernando City, La Union', 'For Engineer Review', NULL, NULL, NULL, 0.00, '2026-06-08 08:05:43', '2026-08-12 02:14:21', NULL, 'rethertr', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'rhrthtr', '[{\"filename\":\"accreditation_files-1780905943534-512217746.docx\",\"originalname\":\"JPACPACO Jobstreet Resume (3).docx\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1780905943534-512217746.docx\",\"size\":14240,\"mimetype\":\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\",\"uploaded_at\":\"2026-06-08T08:05:43.538Z\"}]', 0),
(40, '2026-06-005', 16, 'dfgsdfg', NULL, '2026-07-07', 'Panicsican', 'Panicsican, San Juan, La Union', 'For Purchase', 8, '2026-06-19 03:55:18', NULL, 0.00, '2026-06-08 08:07:04', '2026-06-19 03:55:18', NULL, 'dsfgf', '159166591', 'non_debt', NULL, NULL, NULL, NULL, 'sdg', '[{\"filename\":\"accreditation_files-1780906024109-892457528.docx\",\"originalname\":\"files-1780032565780-641676311.docx\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1780906024109-892457528.docx\",\"size\":32026,\"mimetype\":\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\",\"uploaded_at\":\"2026-06-08T08:07:04.114Z\"}]', 0),
(41, '2026-06-006', 7, 'wasfASFD DWSFEW EWF WW', NULL, '2026-06-22', 'Sto. Rosario', 'Sto. Rosario, San Juan, La Union', 'For Purchase', 8, '2026-06-19 03:55:15', NULL, 1050.00, '2026-06-19 03:52:19', '2026-06-19 03:55:15', NULL, 'Mangaan, Santol, La Union', '299269388', 'non_debt', NULL, NULL, NULL, NULL, 'This is just for testing', '[{\"filename\":\"accreditation_files-1781841139156-673085472.xlsx\",\"originalname\":\"REQUEST-FORM.xlsx\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1781841139156-673085472.xlsx\",\"size\":62304,\"mimetype\":\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\",\"uploaded_at\":\"2026-06-19T03:52:19.334Z\"}]', 0),
(42, '2026-08-007', 5, 'Pang pasita baby', NULL, '2026-08-21', 'BCDA - CCTV', 'Poro point, San Fernando City, La Union', 'For Purchase', 8, '2026-08-12 02:45:02', NULL, 4910.98, '2026-08-12 02:29:38', '2026-08-12 02:45:02', NULL, 'San Juan, La Union', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'Ni Bombo Daniel ijay igi kalsada', NULL, 0),
(43, '2026-08-008', 5, 'Para jay balay para bagyo', '', '2026-08-14', 'BCDA - Control Tower', 'Poro point, San Fernando City, La Union', 'For Super Admin Final Approval', NULL, NULL, NULL, 1324.00, '2026-08-12 03:23:21', '2026-08-12 03:24:58', NULL, 'Ijay igdi lacong', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'NI mang dante', NULL, 0),
(44, '2026-08-009', 5, 'QSD', '', '2026-08-14', 'BCDA - CCA', 'Poro point, San Fernando City, La Union', 'For Super Admin Final Approval', NULL, NULL, NULL, 213.00, '2026-08-12 06:44:50', '2026-08-12 06:46:26', NULL, 'asd', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1),
(45, '2026-08-010', 5, 'AWSFASDF SAF', '', '2026-08-14', 'BCDA - Control Tower', 'Poro point, San Fernando City, La Union', 'For Admin Review', NULL, NULL, NULL, 123.00, '2026-08-12 06:56:28', '2026-08-12 06:57:39', NULL, 'asdfasdf', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1),
(46, '2026-08-011', 5, 'asfdasdf', '', '2026-08-29', 'BCDA - CCTV', 'Poro point, San Fernando City, La Union', 'For Super Admin Final Approval', NULL, NULL, NULL, 23.00, '2026-08-12 07:10:56', '2026-08-12 07:15:18', 47, 'sdf', '393859493', 'non_debt', NULL, NULL, NULL, NULL, '', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_request_items`
--

DROP TABLE IF EXISTS `purchase_request_items`;
CREATE TABLE IF NOT EXISTS `purchase_request_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_request_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) DEFAULT '0.00',
  `total_price` decimal(10,2) DEFAULT '0.00',
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Pending','For Purchase','Purchased','Received') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `received_by` int DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `item_id` (`item_id`),
  KEY `received_by` (`received_by`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_request_items`
--

INSERT INTO `purchase_request_items` (`id`, `purchase_request_id`, `item_id`, `quantity`, `unit_price`, `total_price`, `unit`, `remarks`, `status`, `received_by`, `received_at`, `created_at`) VALUES
(35, 36, 5, 3, 132.00, 396.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-05 06:14:35'),
(36, 37, 5, 1, 23.00, 23.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-08 07:15:18'),
(37, 38, 6, 1, 21.00, 21.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-08 08:02:34'),
(38, 39, 9, 1, 0.00, 0.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-08 08:05:43'),
(39, 40, 5, 1, 0.00, 0.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-08 08:07:04'),
(40, 41, 6, 1, 525.00, 525.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-19 03:52:19'),
(41, 41, 24, 1, 525.00, 525.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-19 03:52:19'),
(42, 42, 22, 1, 1231.00, 1231.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 02:29:38'),
(43, 42, 5, 1, 3245.00, 3245.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 02:29:38'),
(44, 42, 6, 1, 434.98, 434.98, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 02:29:38'),
(45, 43, 5, 1, 1324.00, 1324.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 03:23:21'),
(46, 44, 5, 1, 213.00, 213.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 06:44:50'),
(47, 45, 5, 1, 123.00, 123.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 06:56:28'),
(48, 46, 14, 1, 23.00, 23.00, 'pcs', NULL, 'Pending', NULL, NULL, '2026-08-12 07:10:56');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_request_payment_schedules`
--

DROP TABLE IF EXISTS `purchase_request_payment_schedules`;
CREATE TABLE IF NOT EXISTS `purchase_request_payment_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_request_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pr_payment_date` (`purchase_request_id`,`payment_date`),
  KEY `idx_prps_payment_date` (`payment_date`),
  KEY `fk_pr_schedule_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_request_reviews`
--

DROP TABLE IF EXISTS `purchase_request_reviews`;
CREATE TABLE IF NOT EXISTS `purchase_request_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_request_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `review_status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `review_comment` text COLLATE utf8mb4_unicode_ci,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pr_reviewer` (`purchase_request_id`,`reviewer_id`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `review_status` (`review_status`)
) ENGINE=InnoDB AUTO_INCREMENT=288 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_request_reviews`
--

INSERT INTO `purchase_request_reviews` (`id`, `purchase_request_id`, `reviewer_id`, `review_status`, `review_comment`, `reviewed_at`, `created_at`) VALUES
(204, 36, 6, 'approved', NULL, '2026-06-05 06:16:26', '2026-06-05 06:14:35'),
(205, 36, 12, 'approved', NULL, '2026-06-05 06:15:44', '2026-06-05 06:14:35'),
(206, 36, 13, 'approved', NULL, '2026-06-05 06:15:59', '2026-06-05 06:14:35'),
(207, 36, 8, 'pending', NULL, NULL, '2026-06-05 06:14:35'),
(208, 36, 10, 'pending', NULL, NULL, '2026-06-05 06:14:35'),
(214, 37, 6, 'pending', NULL, NULL, '2026-06-08 07:15:18'),
(215, 37, 12, 'pending', NULL, NULL, '2026-06-08 07:15:18'),
(216, 37, 13, 'pending', NULL, NULL, '2026-06-08 07:15:18'),
(217, 37, 8, 'pending', NULL, NULL, '2026-06-08 07:15:18'),
(218, 37, 10, 'pending', NULL, NULL, '2026-06-08 07:15:18'),
(224, 38, 6, 'approved', NULL, '2026-06-08 08:03:21', '2026-06-08 08:02:34'),
(225, 38, 12, 'approved', NULL, '2026-06-08 08:02:57', '2026-06-08 08:02:34'),
(226, 38, 13, 'approved', NULL, '2026-06-08 08:03:11', '2026-06-08 08:02:34'),
(227, 38, 8, 'pending', NULL, NULL, '2026-06-08 08:02:34'),
(228, 38, 10, 'pending', NULL, NULL, '2026-06-08 08:02:34'),
(229, 39, 6, 'pending', NULL, NULL, '2026-06-08 08:05:43'),
(230, 39, 12, 'pending', NULL, NULL, '2026-06-08 08:05:43'),
(231, 39, 13, 'pending', NULL, NULL, '2026-06-08 08:05:43'),
(232, 39, 8, 'pending', NULL, NULL, '2026-06-08 08:05:43'),
(233, 39, 10, 'pending', NULL, NULL, '2026-06-08 08:05:43'),
(234, 40, 7, 'approved', NULL, '2026-06-08 08:08:09', '2026-06-08 08:07:04'),
(235, 40, 14, 'approved', NULL, '2026-06-08 08:07:33', '2026-06-08 08:07:04'),
(236, 40, 8, 'pending', NULL, NULL, '2026-06-08 08:07:04'),
(237, 40, 10, 'pending', NULL, NULL, '2026-06-08 08:07:04'),
(238, 41, 14, 'approved', 'G', '2026-06-19 03:53:42', '2026-06-19 03:52:19'),
(239, 41, 16, 'approved', 'this is just for testing\n', '2026-06-19 03:54:53', '2026-06-19 03:52:19'),
(240, 41, 8, 'pending', NULL, NULL, '2026-06-19 03:52:19'),
(241, 41, 10, 'pending', NULL, NULL, '2026-06-19 03:52:19'),
(251, 42, 6, 'approved', NULL, '2026-08-12 02:44:30', '2026-08-12 02:30:09'),
(252, 42, 12, 'approved', NULL, '2026-08-12 02:44:20', '2026-08-12 02:30:09'),
(253, 42, 13, 'approved', NULL, '2026-08-12 02:44:10', '2026-08-12 02:30:09'),
(254, 42, 8, 'pending', NULL, NULL, '2026-08-12 02:30:09'),
(255, 42, 10, 'pending', NULL, NULL, '2026-08-12 02:30:09'),
(256, 43, 6, 'approved', NULL, '2026-08-12 03:24:19', '2026-08-12 03:23:32'),
(257, 43, 12, 'approved', NULL, '2026-08-12 03:23:52', '2026-08-12 03:23:32'),
(258, 43, 13, 'approved', NULL, '2026-08-12 03:24:02', '2026-08-12 03:23:32'),
(259, 43, 7, 'approved', NULL, '2026-08-12 03:24:41', '2026-08-12 03:23:32'),
(260, 43, 14, 'approved', NULL, '2026-08-12 03:24:50', '2026-08-12 03:23:32'),
(261, 43, 16, 'approved', NULL, '2026-08-12 03:24:58', '2026-08-12 03:23:32'),
(262, 43, 8, 'pending', NULL, NULL, '2026-08-12 03:23:32'),
(263, 43, 10, 'pending', NULL, NULL, '2026-08-12 03:23:32'),
(264, 44, 6, 'approved', NULL, '2026-08-12 06:45:44', '2026-08-12 06:44:50'),
(265, 44, 12, 'approved', NULL, '2026-08-12 06:45:15', '2026-08-12 06:44:50'),
(266, 44, 13, 'approved', NULL, '2026-08-12 06:45:27', '2026-08-12 06:44:50'),
(267, 44, 7, 'approved', NULL, '2026-08-12 06:46:10', '2026-08-12 06:44:50'),
(268, 44, 14, 'approved', NULL, '2026-08-12 06:46:18', '2026-08-12 06:44:50'),
(269, 44, 16, 'approved', NULL, '2026-08-12 06:46:26', '2026-08-12 06:44:50'),
(270, 44, 8, 'pending', NULL, NULL, '2026-08-12 06:44:50'),
(271, 44, 10, 'pending', NULL, NULL, '2026-08-12 06:44:50'),
(272, 45, 6, 'approved', NULL, '2026-08-12 06:57:39', '2026-08-12 06:56:28'),
(273, 45, 12, 'approved', NULL, '2026-08-12 06:56:44', '2026-08-12 06:56:28'),
(274, 45, 13, 'approved', NULL, '2026-08-12 06:57:18', '2026-08-12 06:56:28'),
(275, 45, 7, 'pending', NULL, NULL, '2026-08-12 06:56:28'),
(276, 45, 14, 'pending', NULL, NULL, '2026-08-12 06:56:28'),
(277, 45, 16, 'pending', NULL, NULL, '2026-08-12 06:56:28'),
(278, 45, 8, 'pending', NULL, NULL, '2026-08-12 06:56:28'),
(279, 45, 10, 'pending', NULL, NULL, '2026-08-12 06:56:28'),
(280, 46, 12, 'approved', NULL, '2026-08-12 07:11:06', '2026-08-12 07:10:56'),
(281, 46, 13, 'approved', NULL, '2026-08-12 07:11:14', '2026-08-12 07:10:56'),
(282, 46, 7, 'approved', NULL, '2026-08-12 07:11:26', '2026-08-12 07:10:56'),
(283, 46, 14, 'approved', NULL, '2026-08-12 07:11:42', '2026-08-12 07:10:56'),
(284, 46, 16, 'approved', NULL, '2026-08-12 07:11:33', '2026-08-12 07:10:56'),
(285, 46, 6, 'pending', NULL, NULL, '2026-08-12 07:10:56'),
(286, 46, 8, 'pending', NULL, NULL, '2026-08-12 07:10:56'),
(287, 46, 10, 'pending', NULL, NULL, '2026-08-12 07:10:56');

-- --------------------------------------------------------

--
-- Table structure for table `reimbursements`
--

DROP TABLE IF EXISTS `reimbursements`;
CREATE TABLE IF NOT EXISTS `reimbursements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rmb_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_by` int NOT NULL,
  `payee` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci,
  `project` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms_note` text COLLATE utf8mb4_unicode_ci,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `date_needed` date DEFAULT NULL,
  `status` enum('Draft','Pending','For Procurement Review','For Super Admin Final Approval','On Hold','For Purchase','PO Created','Payment Request Created','Completed','Rejected','Cancelled','Received') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rmb_number` (`rmb_number`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reimbursement_attachments`
--

DROP TABLE IF EXISTS `reimbursement_attachments`;
CREATE TABLE IF NOT EXISTS `reimbursement_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reimbursement_id` int NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` int NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reimbursement_id` (`reimbursement_id`),
  KEY `uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reimbursement_payment_schedules`
--

DROP TABLE IF EXISTS `reimbursement_payment_schedules`;
CREATE TABLE IF NOT EXISTS `reimbursement_payment_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reimbursement_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rmb_payment_date` (`reimbursement_id`,`payment_date`),
  KEY `idx_rps_payment_date` (`payment_date`),
  KEY `fk_rmb_schedule_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reimbursement_schedule_reminder_logs`
--

DROP TABLE IF EXISTS `reimbursement_schedule_reminder_logs`;
CREATE TABLE IF NOT EXISTS `reimbursement_schedule_reminder_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `reminder_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rmb_schedule_reminder` (`schedule_id`,`reminder_type`),
  KEY `idx_rsrl_type_sent_at` (`reminder_type`,`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_requests`
--

DROP TABLE IF EXISTS `service_requests`;
CREATE TABLE IF NOT EXISTS `service_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sr_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: SRV-YYYY-MM-XXX',
  `requested_by` int NOT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Detailed service description',
  `service_type` enum('Rent','Job Order','Contractor','Service','Others') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Service',
  `project` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` int DEFAULT NULL COMMENT 'Selected supplier/contractor',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `date_needed` date DEFAULT NULL,
  `status` enum('Draft','For Procurement Review','For Super Admin Final Approval','Approved','Payment Request Created','Payment Order Created','Rejected','Cancelled','PO Created','Paid','Received') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `order_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms_note` text COLLATE utf8mb4_unicode_ci,
  `sr_type` enum('payment_request','payment_order') COLLATE utf8mb4_unicode_ci DEFAULT 'payment_request' COMMENT 'Type: payment_request (amount+qty) vs payment_order (amount only)',
  `quantity` decimal(10,2) DEFAULT NULL COMMENT 'Quantity for payment_request type',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unit of measurement (e.g., pcs, hours, days)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sr_number` (`sr_number`),
  KEY `requested_by` (`requested_by`),
  KEY `supplier_id` (`supplier_id`),
  KEY `approved_by` (`approved_by`),
  KEY `status` (`status`),
  KEY `service_type` (`service_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_request_payment_schedules`
--

DROP TABLE IF EXISTS `service_request_payment_schedules`;
CREATE TABLE IF NOT EXISTS `service_request_payment_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_request_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sr_payment_date` (`service_request_id`,`payment_date`),
  KEY `idx_srps_payment_date` (`payment_date`),
  KEY `fk_sr_schedule_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_schedule_reminder_logs`
--

DROP TABLE IF EXISTS `service_schedule_reminder_logs`;
CREATE TABLE IF NOT EXISTS `service_schedule_reminder_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `reminder_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sr_schedule_reminder` (`schedule_id`,`reminder_type`),
  KEY `idx_ssrl_type_sent_at` (`reminder_type`,`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `accredited` tinyint(1) DEFAULT '0' COMMENT '1 if supplier is accredited/legit, 0 if not accredited/fake',
  `accredited_by` int DEFAULT NULL COMMENT 'Employee who accredited the supplier',
  `accredited_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when supplier was accredited',
  `accreditation_files` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of accreditation file paths',
  `accreditation_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes about accreditation documents',
  PRIMARY KEY (`id`),
  UNIQUE KEY `supplier_code` (`supplier_code`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_accredited_by` (`accredited_by`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `supplier_code`, `supplier_name`, `contact_person`, `email`, `phone`, `address`, `status`, `created_at`, `updated_at`, `accredited`, `accredited_by`, `accredited_at`, `accreditation_files`, `accreditation_notes`) VALUES
(46, 'SUP09497652', 'fh', NULL, NULL, NULL, 'fd', 'Active', '2026-06-05 06:14:54', '2026-06-05 06:15:29', 1, 8, '2026-06-05 06:15:29', NULL, NULL),
(47, 'SUP64822836', 'asdfa', 'Dante Obaldo Rillera', '', '', 'sdf', 'Active', '2026-06-08 07:27:28', '2026-06-09 00:54:49', 1, 8, '2026-06-08 07:53:51', NULL, NULL),
(48, 'SUP46201036', 'rhrthtr', NULL, NULL, NULL, 'rethertr', 'Active', '2026-06-09 00:54:22', '2026-08-12 02:14:21', 1, 8, '2026-08-12 02:14:21', NULL, NULL),
(49, 'SUP46201279', 'sdg', NULL, NULL, NULL, 'dsfgf', 'Active', '2026-06-09 00:54:22', '2026-08-12 02:14:22', 1, 8, '2026-08-12 02:14:22', NULL, NULL),
(50, 'SUP46201431', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 00:54:22', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(51, 'SUP46388670', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 00:54:23', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(52, 'SUP46628356', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 00:54:26', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(53, 'SUP90319766', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:01:43', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(54, 'SUP9061019', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:01:46', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(55, 'SUP95983896', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:02:39', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(56, 'SUP9774432', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:02:57', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(57, 'SUP98590149', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:03:05', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(58, 'SUP99064934', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:03:10', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(59, 'SUP11313868', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:05:13', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(60, 'SUP50310056', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:11:43', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(61, 'SUP50591577', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:11:45', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(62, 'SUP51188185', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:11:51', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(63, 'SUP52213241', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:12:02', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(64, 'SUP53150066', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:12:11', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(65, 'SUP63034425', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Active', '2026-06-09 01:13:50', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL),
(66, 'SUP16634148', 'This is just for testing', NULL, NULL, NULL, 'Mangaan, Santol, La Union', 'Active', '2026-06-19 03:52:46', '2026-06-19 03:52:57', 1, 8, '2026-06-19 03:52:57', NULL, NULL),
(67, 'SUP80713854', 'Ni Bombo Daniel ijay igi kalsada', NULL, NULL, NULL, 'San Juan, La Union', 'Active', '2026-08-12 02:30:07', '2026-08-12 02:30:09', 1, 8, '2026-08-12 02:30:09', NULL, NULL),
(68, 'SUP01041444', 'NI mang dante', NULL, NULL, NULL, 'Ijay igdi lacong', 'Active', '2026-08-12 03:23:30', '2026-08-12 03:23:32', 1, 8, '2026-08-12 03:23:32', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `supplier_items`
--

DROP TABLE IF EXISTS `supplier_items`;
CREATE TABLE IF NOT EXISTS `supplier_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `item_id` int NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `lead_time_days` int DEFAULT NULL COMMENT 'Estimated delivery time in days',
  `is_preferred` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_supplier_item` (`supplier_id`,`item_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cash_requests`
--
ALTER TABLE `cash_requests`
  ADD CONSTRAINT `cash_requests_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `cash_requests_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cash_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cash_request_payment_schedules`
--
ALTER TABLE `cash_request_payment_schedules`
  ADD CONSTRAINT `fk_cr_schedule_cr` FOREIGN KEY (`cash_request_id`) REFERENCES `cash_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cr_schedule_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cash_schedule_reminder_logs`
--
ALTER TABLE `cash_schedule_reminder_logs`
  ADD CONSTRAINT `fk_csrl_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `cash_request_payment_schedules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- Constraints for table `disbursement_vouchers`
--
ALTER TABLE `disbursement_vouchers`
  ADD CONSTRAINT `disbursement_vouchers_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `disbursement_vouchers_ibfk_2` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `disbursement_vouchers_ibfk_3` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `disbursement_vouchers_ibfk_4` FOREIGN KEY (`prepared_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `disbursement_vouchers_ibfk_5` FOREIGN KEY (`certified_by_accounting`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `disbursement_vouchers_ibfk_6` FOREIGN KEY (`certified_by_manager`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `disbursement_vouchers_ibfk_7` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `disbursement_vouchers_ibfk_8` FOREIGN KEY (`cash_request_id`) REFERENCES `cash_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_dv_payment_order` FOREIGN KEY (`payment_order_id`) REFERENCES `payment_orders` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `document_layouts`
--
ALTER TABLE `document_layouts`
  ADD CONSTRAINT `document_layouts_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `document_layouts_updated_by_fk` FOREIGN KEY (`updated_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `items_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- Constraints for table `layout_versions`
--
ALTER TABLE `layout_versions`
  ADD CONSTRAINT `layout_versions_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `layout_versions_layout_fk` FOREIGN KEY (`layout_id`) REFERENCES `document_layouts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `order_number_locks`
--
ALTER TABLE `order_number_locks`
  ADD CONSTRAINT `fk_order_number_locks_locked_by` FOREIGN KEY (`locked_by`) REFERENCES `employees` (`id`);

--
-- Constraints for table `payment_orders`
--
ALTER TABLE `payment_orders`
  ADD CONSTRAINT `fk_po_cash_request` FOREIGN KEY (`cash_request_id`) REFERENCES `cash_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_orders_ibfk_1` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_orders_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`);

--
-- Constraints for table `payment_requests`
--
ALTER TABLE `payment_requests`
  ADD CONSTRAINT `fk_payment_requests_service_request_id` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_requests_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `payment_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `payment_requests_ibfk_4` FOREIGN KEY (`dv_id`) REFERENCES `disbursement_vouchers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_request_items`
--
ALTER TABLE `payment_request_items`
  ADD CONSTRAINT `payment_request_items_ibfk_1` FOREIGN KEY (`payment_request_id`) REFERENCES `payment_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_request_items_ibfk_2` FOREIGN KEY (`pr_item_id`) REFERENCES `purchase_request_items` (`id`),
  ADD CONSTRAINT `payment_request_items_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `payment_schedule_reminder_logs`
--
ALTER TABLE `payment_schedule_reminder_logs`
  ADD CONSTRAINT `fk_reminder_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `purchase_request_payment_schedules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `po_attachments`
--
ALTER TABLE `po_attachments`
  ADD CONSTRAINT `po_attachments_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `po_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`);

--
-- Constraints for table `pr_item_rejection_remarks`
--
ALTER TABLE `pr_item_rejection_remarks`
  ADD CONSTRAINT `pr_item_rejection_remarks_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pr_item_rejection_remarks_ibfk_2` FOREIGN KEY (`purchase_request_item_id`) REFERENCES `purchase_request_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pr_item_rejection_remarks_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `pr_item_rejection_remarks_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `fk_po_installment_schedule_id` FOREIGN KEY (`installment_schedule_id`) REFERENCES `purchase_request_payment_schedules` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_po_parent_po_id` FOREIGN KEY (`parent_po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD CONSTRAINT `purchase_requests_payment_terms_set_by_fk` FOREIGN KEY (`payment_terms_set_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_request_payment_schedules`
--
ALTER TABLE `purchase_request_payment_schedules`
  ADD CONSTRAINT `fk_pr_schedule_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pr_schedule_pr` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_request_reviews`
--
ALTER TABLE `purchase_request_reviews`
  ADD CONSTRAINT `pr_reviews_pr_fk` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pr_reviews_reviewer_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reimbursement_payment_schedules`
--
ALTER TABLE `reimbursement_payment_schedules`
  ADD CONSTRAINT `fk_rmb_schedule_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_rmb_schedule_rmb` FOREIGN KEY (`reimbursement_id`) REFERENCES `reimbursements` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reimbursement_schedule_reminder_logs`
--
ALTER TABLE `reimbursement_schedule_reminder_logs`
  ADD CONSTRAINT `fk_rsrl_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `reimbursement_payment_schedules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_request_payment_schedules`
--
ALTER TABLE `service_request_payment_schedules`
  ADD CONSTRAINT `fk_sr_schedule_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sr_schedule_sr` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_schedule_reminder_logs`
--
ALTER TABLE `service_schedule_reminder_logs`
  ADD CONSTRAINT `fk_ssrl_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `service_request_payment_schedules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `fk_accredited_by` FOREIGN KEY (`accredited_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
