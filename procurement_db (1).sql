-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 05, 2026 at 05:07 AM
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
  `role` enum('engineer','procurement','admin','super_admin','super_admin_rep') COLLATE utf8mb4_unicode_ci DEFAULT 'engineer',
  `department` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fcm_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_no` (`employee_no`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_no`, `first_name`, `middle_initial`, `last_name`, `role`, `department`, `password`, `is_active`, `created_at`, `updated_at`, `email`, `fcm_token`) VALUES
(5, 'ENG-2026-0001', 'Michelle', 'T', 'Norial', 'super_admin_rep', 'Engineering', '$2a$10$g5BT/XyIWksZvK4LqqQTjuL/pjSglLqGdRQCGoPw375t5Q2g4XkKK', 1, '2026-02-10 02:36:33', '2026-08-14 04:52:27', NULL, NULL),
(6, 'PRO-2026-0001', 'Junnel', 'B', 'Tadina', 'engineer', 'Procurement', '$2a$10$gqG3xZE0xaT/aA5BvUMpJeVQ3vbYoOoiqS2QP7HBC3XZwm.4qusQu', 1, '2026-02-10 02:36:33', '2026-08-14 06:47:24', NULL, NULL),
(7, 'ADMIN-2026-0001', 'ELAINE', 'M', 'AGUILAR', 'admin', 'Administration', '$2a$10$gqG3xZE0xaT/aA5BvUMpJeVQ3vbYoOoiqS2QP7HBC3XZwm.4qusQu', 1, '2026-02-10 02:36:33', '2026-08-12 06:06:26', NULL, NULL),
(8, 'SA-2026-004', 'Marc', 'J', 'Arzadon', 'super_admin', 'Management', '$2a$10$axW..03rjtzmDLOgyvn2ceyJResqKMyiyWQD7vYUa3gmTWvRqaENq', 1, '2026-02-10 02:36:33', '2026-04-14 01:20:11', NULL, NULL),
(10, 'SA001', 'Super', 'D', 'Adminesu', 'super_admin', 'Management', '$2a$10$2VAa8J7EZDnfspG1/t4G1ez6MXGEnf3DLiPNqcJEm4ypE0p9RATNq', 1, '2026-02-12 00:55:00', '2026-02-12 02:48:05', NULL, NULL),
(12, 'ENG-2026-0005', 'Joylene', 'F', 'Balanon', 'engineer', 'Engineering', '$2a$10$fFUgVn7r1fE8YPLnwcTDZOhWhEhjxY1gg3rULIps0uoMBVsBE95W.', 1, '2026-02-12 02:45:21', '2026-02-12 02:50:16', NULL, NULL),
(13, 'ENG-2026-0006', 'Winnielyn Kaye', 'W', 'Olarte', 'engineer', 'Procurement', '$2a$10$.GDmwlv/XvEmPJzt3oIb0.39RVYiJMsxBwcTaMbmFInk3th76KpIu', 1, '2026-02-12 02:45:41', '2026-02-12 02:54:11', NULL, NULL),
(14, 'ADMIN-2026-0002', 'RONALYN', 'W', 'MALLARE', 'admin', 'Administration', '$2a$10$zZXZI/tYRPS37ZQVDeThpeaBi5uCv1P1e1EsBkScqRmt/1.iZPFWK', 1, '2026-02-12 02:46:45', '2026-08-12 06:06:09', NULL, NULL),
(16, 'ADMIN-2026-0004', 'MARJORIE', 'O', 'GARCIA', 'admin', 'Administration', '$2a$10$pj5HrIzaIYIkWlCbcOy9sOBNxrQitgV2.Umuh.wldfJWEYy5t0Ta6', 1, '2026-02-12 02:47:46', '2026-08-12 06:06:00', NULL, NULL),
(19, 'ADMIN-2026-0005', 'LYRA', 'F', 'JAVONILLO', 'admin', 'Administration', '$2a$10$xHUq1Y4DXeC9lhhcLPiTy.Y/s2MXaqR737x4Rdw8iHK4Cfw8q5qjG', 1, '2026-08-14 06:48:34', '2026-08-14 06:48:34', NULL, NULL),
(20, 'ENG-2026-0008', 'EARL', 'N', 'NISPEROS', 'engineer', 'Engineering', '$2a$10$HwoxtxQmy2HMokTt1s6tie1PfKKbP24wZ7gJHMBCDX16kLKo8SXy2', 1, '2026-08-14 06:51:13', '2026-08-14 06:51:13', NULL, NULL),
(21, 'ENG-2026-0009', 'JOANA', 'M', 'BAAGEN', 'engineer', 'Engineering', '$2a$10$opLKGHpkkVuulYRfKf3L3uNrDdGj3LkQM0GKa3nBF3orWE.YcoSz2', 1, '2026-08-14 06:51:30', '2026-08-14 06:51:30', NULL, NULL);

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
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_code` (`item_code`),
  UNIQUE KEY `item_name` (`item_name`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `item_code`, `item_name`, `description`, `category_id`, `unit`, `created_by`, `status`, `created_at`, `updated_at`, `image_url`) VALUES
(1, 'sdfgsdfg', 'sdfgsdg', 'sadgfs', 10, 'pcs', 8, 'Active', '2026-05-22 02:01:54', '2026-05-22 02:01:54', NULL),
(2, 'asefsdfgdsg', 'dsfgdf', 'afrwfasdtgsdg', 10, 'set', 8, 'Active', '2026-05-22 02:02:38', '2026-05-22 02:02:38', NULL),
(3, 'ITM001', 'Laptop Dell Latitude', 'Business laptop 15.6 inch', 1, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(4, 'ITM002', 'Wireless Mouse', 'USB wireless mouse', 1, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(5, 'ITM003', 'A4 Paper (Ream)', 'Premium quality A4 paper', 2, 'ream', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(6, 'ITM004', 'Ballpen Blue (Box)', 'Box of 12 blue ballpens', 2, 'box', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(7, 'ITM005', 'Safety Helmet', 'Hard hat for construction', 3, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(8, 'ITM006', 'Safety Vest Reflective', 'High-vis safety vest', 3, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(9, 'ITM007', 'Cordless Drill 18V', 'Cordless drill driver', 4, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(10, 'ITM008', 'Hammer Claw 16oz', 'Fiberglass handle hammer', 4, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(11, 'ITM009', 'Portland Cement 40kg', 'Type I cement bag', 5, 'bag', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(12, 'ITM010', 'Steel Rod 10mm', 'Deformed steel bar', 5, 'length', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(13, 'ITM011', 'THHN Wire 2.0mm', 'Electrical building wire roll', 6, 'roll', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(14, 'ITM012', 'Circuit Breaker 20A', 'Single pole breaker', 6, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(15, 'ITM013', 'PVC Pipe 2 inch', '6m Schedule 40 PVC pipe', 7, 'length', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(16, 'ITM014', 'Gate Valve 1 inch', 'Brass gate valve', 7, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(17, 'ITM015', 'Latex Paint White 4L', 'White latex paint', 8, 'gal', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(18, 'ITM016', 'Paint Roller 9 inch', 'Foam roller', 8, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(19, 'ITM017', 'Hydraulic Oil 46', '20L hydraulic fluid', 9, 'drum', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(20, 'ITM018', 'Floor Cleaner 5L', 'Industrial floor cleaner', 10, 'bottle', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(21, 'ITM019', 'Office Chair Ergonomic', 'Mesh office chair', 11, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(22, 'ITM020', 'Carton Box Medium', 'Corrugated shipping box', 12, 'pcs', NULL, 'Active', '2026-05-22 02:03:05', '2026-05-22 02:03:05', NULL),
(23, 'SKU-023', 'junell tadina', 'xfdhfgh', 3, 'pcs', 5, 'Active', '2026-06-08 01:53:24', '2026-06-08 01:53:24', NULL),
(24, 'SKU-024', 'Laminator', 'this is just for testing', 2, 'pcs', 7, 'Active', '2026-06-19 03:50:52', '2026-06-19 03:50:52', NULL),
(25, 'SKU-025', 'Bond Paper', '', 2, 'pcs', 13, 'Active', '2026-09-03 06:42:21', '2026-09-03 06:42:21', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=541 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_id`, `title`, `message`, `type`, `related_id`, `related_type`, `is_read`, `created_at`) VALUES
(219, 6, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 0, '2026-06-05 06:14:35'),
(220, 12, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 1, '2026-06-05 06:14:35'),
(221, 13, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 1, '2026-06-05 06:14:35'),
(222, 8, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 1, '2026-06-05 06:14:35'),
(223, 10, 'New PR Created', 'Purchase Request 2026-06-001 has been created and is ready for your review', 'PR Created', 36, 'purchase_request', 1, '2026-06-05 06:14:35'),
(224, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-06-001 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 36, 'purchase_request', 1, '2026-06-05 06:16:26'),
(225, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-06-001 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 36, 'purchase_request', 1, '2026-06-05 06:16:26'),
(226, 6, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 0, '2026-06-08 07:15:18'),
(227, 12, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 1, '2026-06-08 07:15:18'),
(228, 13, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 1, '2026-06-08 07:15:18'),
(229, 8, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 1, '2026-06-08 07:15:18'),
(230, 10, 'New PR Created', 'Purchase Request 2026-06-002 has been created and is ready for your review', 'PR Created', 37, 'purchase_request', 1, '2026-06-08 07:15:18'),
(231, 6, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 0, '2026-06-08 08:02:34'),
(232, 12, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 1, '2026-06-08 08:02:34'),
(233, 13, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 1, '2026-06-08 08:02:34'),
(234, 8, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 1, '2026-06-08 08:02:34'),
(235, 10, 'New PR Created', 'Purchase Request 2026-06-003 has been created and is ready for your review', 'PR Created', 38, 'purchase_request', 1, '2026-06-08 08:02:34'),
(236, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-06-003 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 38, 'purchase_request', 1, '2026-06-08 08:03:21'),
(237, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-06-003 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 38, 'purchase_request', 1, '2026-06-08 08:03:21'),
(238, 6, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 0, '2026-06-08 08:05:43'),
(239, 12, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 1, '2026-06-08 08:05:43'),
(240, 13, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 1, '2026-06-08 08:05:43'),
(241, 8, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 1, '2026-06-08 08:05:43'),
(242, 10, 'New PR Created', 'Purchase Request 2026-06-004 has been created and is ready for your review', 'PR Created', 39, 'purchase_request', 1, '2026-06-08 08:05:43'),
(243, 7, 'New PR Created', 'Purchase Request 2026-06-005 has been created and is ready for your review', 'PR Created', 40, 'purchase_request', 1, '2026-06-08 08:07:04'),
(244, 14, 'New PR Created', 'Purchase Request 2026-06-005 has been created and is ready for your review', 'PR Created', 40, 'purchase_request', 0, '2026-06-08 08:07:04'),
(245, 8, 'New PR Created', 'Purchase Request 2026-06-005 has been created and is ready for your review', 'PR Created', 40, 'purchase_request', 1, '2026-06-08 08:07:04'),
(246, 10, 'New PR Created', 'Purchase Request 2026-06-005 has been created and is ready for your review', 'PR Created', 40, 'purchase_request', 1, '2026-06-08 08:07:04'),
(247, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-06-005 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 40, 'purchase_request', 1, '2026-06-08 08:08:09'),
(248, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-06-005 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 40, 'purchase_request', 1, '2026-06-08 08:08:09'),
(249, 14, 'New PR Created', 'Purchase Request 2026-06-006 has been created and is ready for your review', 'PR Created', 41, 'purchase_request', 0, '2026-06-19 03:52:19'),
(250, 16, 'New PR Created', 'Purchase Request 2026-06-006 has been created and is ready for your review', 'PR Created', 41, 'purchase_request', 0, '2026-06-19 03:52:19'),
(251, 8, 'New PR Created', 'Purchase Request 2026-06-006 has been created and is ready for your review', 'PR Created', 41, 'purchase_request', 1, '2026-06-19 03:52:19'),
(252, 10, 'New PR Created', 'Purchase Request 2026-06-006 has been created and is ready for your review', 'PR Created', 41, 'purchase_request', 1, '2026-06-19 03:52:19'),
(253, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-06-006 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 41, 'purchase_request', 1, '2026-06-19 03:54:53'),
(254, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-06-006 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 41, 'purchase_request', 1, '2026-06-19 03:54:53'),
(255, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-08-007 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 42, 'purchase_request', 1, '2026-08-12 02:44:30'),
(256, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-08-007 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 42, 'purchase_request', 1, '2026-08-12 02:44:30'),
(257, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 1, '2026-08-12 03:24:19'),
(258, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:19'),
(259, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:19'),
(260, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 1, '2026-08-12 03:24:41'),
(261, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:41'),
(262, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:41'),
(263, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 1, '2026-08-12 03:24:50'),
(264, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:50'),
(265, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-008 has been reviewed by engineers and is ready for admin review', 'PR Review', 43, 'purchase_request', 0, '2026-08-12 03:24:50'),
(266, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-08-008 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 43, 'purchase_request', 1, '2026-08-12 03:24:58'),
(267, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-08-008 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 43, 'purchase_request', 1, '2026-08-12 03:24:58'),
(268, 6, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(269, 12, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 1, '2026-08-12 06:44:50'),
(270, 13, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 1, '2026-08-12 06:44:50'),
(271, 7, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 1, '2026-08-12 06:44:50'),
(272, 14, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(273, 16, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 0, '2026-08-12 06:44:50'),
(274, 8, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 1, '2026-08-12 06:44:50'),
(275, 10, 'New PR Created', 'Purchase Request 2026-08-009 has been created and is ready for your review', 'PR Created', 44, 'purchase_request', 1, '2026-08-12 06:44:50'),
(276, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 1, '2026-08-12 06:45:44'),
(277, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:45:44'),
(278, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:45:44'),
(279, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 1, '2026-08-12 06:46:10'),
(280, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:10'),
(281, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:10'),
(282, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 1, '2026-08-12 06:46:18'),
(283, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:18'),
(284, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-009 has been reviewed by engineers and is ready for admin review', 'PR Review', 44, 'purchase_request', 0, '2026-08-12 06:46:18'),
(285, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-08-009 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 44, 'purchase_request', 1, '2026-08-12 06:46:26'),
(286, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-08-009 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 44, 'purchase_request', 1, '2026-08-12 06:46:26'),
(287, 6, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(288, 12, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 1, '2026-08-12 06:56:28'),
(289, 13, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 1, '2026-08-12 06:56:28'),
(290, 7, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 1, '2026-08-12 06:56:28'),
(291, 14, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(292, 16, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 0, '2026-08-12 06:56:28'),
(293, 8, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 1, '2026-08-12 06:56:28'),
(294, 10, 'New PR Created', 'Purchase Request 2026-08-010 has been created and is ready for your review', 'PR Created', 45, 'purchase_request', 1, '2026-08-12 06:56:28'),
(295, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-010 has been reviewed by engineers and is ready for admin review', 'PR Review', 45, 'purchase_request', 1, '2026-08-12 06:57:39'),
(296, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-010 has been reviewed by engineers and is ready for admin review', 'PR Review', 45, 'purchase_request', 0, '2026-08-12 06:57:39'),
(297, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-010 has been reviewed by engineers and is ready for admin review', 'PR Review', 45, 'purchase_request', 0, '2026-08-12 06:57:39'),
(298, 12, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 1, '2026-08-12 07:10:56'),
(299, 13, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 1, '2026-08-12 07:10:56'),
(300, 7, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 1, '2026-08-12 07:10:56'),
(301, 14, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(302, 16, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(303, 6, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 0, '2026-08-12 07:10:56'),
(304, 8, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 1, '2026-08-12 07:10:56'),
(305, 10, 'New PR Created', 'Purchase Request 2026-08-011 has been created and is ready for your review', 'PR Created', 46, 'purchase_request', 1, '2026-08-12 07:10:56'),
(306, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 1, '2026-08-12 07:11:14'),
(307, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:14'),
(308, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:14'),
(309, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 1, '2026-08-12 07:11:26'),
(310, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:26'),
(311, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:26'),
(312, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 1, '2026-08-12 07:11:33'),
(313, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:33'),
(314, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-011 has been reviewed by engineers and is ready for admin review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:33'),
(315, 6, 'PR Ready for Procurement Review', 'Purchase Request 2026-08-011 has been reviewed by admins and is ready for procurement review', 'PR Review', 46, 'purchase_request', 0, '2026-08-12 07:11:42'),
(316, 8, 'PR Pending Final Approval', 'Purchase Request 2026-08-011 has been reviewed by Procurement and requires your final approval', 'PR Approved', 46, 'purchase_request', 1, '2026-08-12 07:15:18'),
(317, 10, 'PR Pending Final Approval', 'Purchase Request 2026-08-011 has been reviewed by Procurement and requires your final approval', 'PR Approved', 46, 'purchase_request', 1, '2026-08-12 07:15:18'),
(318, 5, 'PR Values Modified by Procurement', 'Procurement modified values in your PR 2026-08-011: Circuit Breaker 20A: unit price from ₱23.00 to ₱23, unit from \"null\" to \"pcs\"', 'PR Modified', 46, 'purchase_request', 0, '2026-08-12 07:15:18'),
(319, 14, 'New PR Created', 'Purchase Request 2026-08-012 has been created and is ready for your review', 'PR Created', 47, 'purchase_request', 0, '2026-08-13 01:42:45'),
(320, 16, 'New PR Created', 'Purchase Request 2026-08-012 has been created and is ready for your review', 'PR Created', 47, 'purchase_request', 0, '2026-08-13 01:42:45'),
(321, 8, 'New PR Created', 'Purchase Request 2026-08-012 has been created and is ready for your review', 'PR Created', 47, 'purchase_request', 1, '2026-08-13 01:42:45'),
(322, 10, 'New PR Created', 'Purchase Request 2026-08-012 has been created and is ready for your review', 'PR Created', 47, 'purchase_request', 1, '2026-08-13 01:42:45'),
(323, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-08-012 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 47, 'purchase_request', 1, '2026-08-13 01:43:04'),
(324, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-08-012 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 47, 'purchase_request', 1, '2026-08-13 01:43:04'),
(325, 14, 'New PR Created', 'Purchase Request 2026-08-013 has been created and is ready for your review', 'PR Created', 48, 'purchase_request', 0, '2026-08-13 01:53:35'),
(326, 16, 'New PR Created', 'Purchase Request 2026-08-013 has been created and is ready for your review', 'PR Created', 48, 'purchase_request', 0, '2026-08-13 01:53:35'),
(327, 8, 'New PR Created', 'Purchase Request 2026-08-013 has been created and is ready for your review', 'PR Created', 48, 'purchase_request', 1, '2026-08-13 01:53:35'),
(328, 10, 'New PR Created', 'Purchase Request 2026-08-013 has been created and is ready for your review', 'PR Created', 48, 'purchase_request', 1, '2026-08-13 01:53:35'),
(329, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-08-013 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 48, 'purchase_request', 1, '2026-08-13 01:54:01'),
(330, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-08-013 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 48, 'purchase_request', 1, '2026-08-13 01:54:01'),
(331, 8, 'New PO Pending Approval', 'Purchase Order EAN-2026-08-001 has been created and requires your approval', 'PO Created', 2, 'purchase_order', 1, '2026-08-13 01:56:32'),
(332, 10, 'New PO Pending Approval', 'Purchase Order EAN-2026-08-001 has been created and requires your approval', 'PO Created', 2, 'purchase_order', 1, '2026-08-13 01:56:32'),
(333, 5, 'PR Rejected', 'Your Purchase Request 2026-08-010 has been rejected', 'PR Rejected', 45, 'purchase_request', 0, '2026-08-14 00:31:09'),
(334, 7, 'PR Rejected', 'Your Purchase Request 2026-08-014 has been rejected', 'PR Rejected', 49, 'purchase_request', 1, '2026-08-14 00:31:39'),
(335, 13, 'New PR Created', 'Purchase Request 2026-08-015 has been created and is ready for your review', 'PR Created', 50, 'purchase_request', 1, '2026-08-14 05:01:05'),
(336, 7, 'New PR Created', 'Purchase Request 2026-08-015 has been created and is ready for your review', 'PR Created', 50, 'purchase_request', 1, '2026-08-14 05:01:05'),
(337, 14, 'New PR Created', 'Purchase Request 2026-08-015 has been created and is ready for your review', 'PR Created', 50, 'purchase_request', 0, '2026-08-14 05:01:05'),
(338, 16, 'New PR Created', 'Purchase Request 2026-08-015 has been created and is ready for your review', 'PR Created', 50, 'purchase_request', 0, '2026-08-14 05:01:05'),
(339, 5, 'New PR Created', 'Purchase Request 2026-08-015 has been created and is ready for your review', 'PR Created', 50, 'purchase_request', 0, '2026-08-14 05:01:05'),
(340, 8, 'New PR Created', 'Purchase Request 2026-08-015 has been created and is ready for your review', 'PR Created', 50, 'purchase_request', 1, '2026-08-14 05:01:05'),
(341, 10, 'New PR Created', 'Purchase Request 2026-08-015 has been created and is ready for your review', 'PR Created', 50, 'purchase_request', 1, '2026-08-14 05:01:05'),
(342, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-015 has been reviewed by engineers and is ready for admin review', 'PR Review', 50, 'purchase_request', 1, '2026-08-14 05:01:19'),
(343, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-015 has been reviewed by engineers and is ready for admin review', 'PR Review', 50, 'purchase_request', 0, '2026-08-14 05:01:19'),
(344, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-015 has been reviewed by engineers and is ready for admin review', 'PR Review', 50, 'purchase_request', 0, '2026-08-14 05:01:19'),
(345, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-015 has been reviewed by engineers and is ready for admin review', 'PR Review', 50, 'purchase_request', 1, '2026-08-14 05:01:40'),
(346, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-015 has been reviewed by engineers and is ready for admin review', 'PR Review', 50, 'purchase_request', 0, '2026-08-14 05:01:40'),
(347, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-015 has been reviewed by engineers and is ready for admin review', 'PR Review', 50, 'purchase_request', 0, '2026-08-14 05:01:40'),
(348, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-015 has been reviewed by engineers and is ready for admin review', 'PR Review', 50, 'purchase_request', 1, '2026-08-14 05:01:49'),
(349, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-015 has been reviewed by engineers and is ready for admin review', 'PR Review', 50, 'purchase_request', 0, '2026-08-14 05:01:49'),
(350, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-015 has been reviewed by engineers and is ready for admin review', 'PR Review', 50, 'purchase_request', 0, '2026-08-14 05:01:49'),
(351, 5, 'PR Ready for Super Admin Representative Review', 'Purchase Request 2026-08-015 has been reviewed by admins and is ready for Super Admin Representative review', 'PR Review', 50, 'purchase_request', 0, '2026-08-14 05:01:58'),
(352, 8, 'PR Approved (< 10,000)', 'Purchase Request 2026-08-015 has been approved by Super Admin Representative and is ready for PO creation', 'PR Review', 50, 'purchase_request', 1, '2026-08-14 05:02:38'),
(353, 10, 'PR Approved (< 10,000)', 'Purchase Request 2026-08-015 has been approved by Super Admin Representative and is ready for PO creation', 'PR Review', 50, 'purchase_request', 1, '2026-08-14 05:02:38'),
(354, 14, 'New PR Created', 'Purchase Request 2026-08-016 has been created and is ready for your review', 'PR Created', 51, 'purchase_request', 0, '2026-08-14 05:04:03'),
(355, 16, 'New PR Created', 'Purchase Request 2026-08-016 has been created and is ready for your review', 'PR Created', 51, 'purchase_request', 0, '2026-08-14 05:04:03'),
(356, 5, 'New PR Created', 'Purchase Request 2026-08-016 has been created and is ready for your review', 'PR Created', 51, 'purchase_request', 0, '2026-08-14 05:04:04'),
(357, 8, 'New PR Created', 'Purchase Request 2026-08-016 has been created and is ready for your review', 'PR Created', 51, 'purchase_request', 1, '2026-08-14 05:04:04'),
(358, 10, 'New PR Created', 'Purchase Request 2026-08-016 has been created and is ready for your review', 'PR Created', 51, 'purchase_request', 1, '2026-08-14 05:04:04'),
(359, 5, 'PR Ready for Super Admin Representative Review', 'Purchase Request 2026-08-016 has been reviewed by admins and is ready for Super Admin Representative review', 'PR Review', 51, 'purchase_request', 0, '2026-08-14 05:04:18'),
(360, 8, 'PR Approved (< 10,000)', 'Purchase Request 2026-08-016 has been approved by Super Admin Representative and is ready for PO creation', 'PR Review', 51, 'purchase_request', 1, '2026-08-14 05:04:34'),
(361, 10, 'PR Approved (< 10,000)', 'Purchase Request 2026-08-016 has been approved by Super Admin Representative and is ready for PO creation', 'PR Review', 51, 'purchase_request', 1, '2026-08-14 05:04:34'),
(362, 8, 'New PR Created', 'Purchase Request 2026-08-017 has been created and is ready for your review', 'PR Created', 52, 'purchase_request', 1, '2026-08-14 06:49:20'),
(363, 10, 'New PR Created', 'Purchase Request 2026-08-017 has been created and is ready for your review', 'PR Created', 52, 'purchase_request', 1, '2026-08-14 06:49:20'),
(364, 6, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 0, '2026-08-14 06:52:32'),
(365, 13, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 1, '2026-08-14 06:52:32'),
(366, 20, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 0, '2026-08-14 06:52:32'),
(367, 21, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 0, '2026-08-14 06:52:32'),
(368, 7, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 1, '2026-08-14 06:52:32'),
(369, 14, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 0, '2026-08-14 06:52:32'),
(370, 16, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 0, '2026-08-14 06:52:32'),
(371, 19, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 0, '2026-08-14 06:52:32'),
(372, 5, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 0, '2026-08-14 06:52:32'),
(373, 8, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 1, '2026-08-14 06:52:32'),
(374, 10, 'New PR Created', 'Purchase Request 2026-08-019 has been created and is ready for your review', 'PR Created', 54, 'purchase_request', 1, '2026-08-14 06:52:32'),
(375, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 1, '2026-08-14 06:53:18'),
(376, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:18'),
(377, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:18'),
(378, 19, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:18'),
(379, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 1, '2026-08-14 06:53:29'),
(380, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:29'),
(381, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:29'),
(382, 19, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:29'),
(383, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 1, '2026-08-14 06:53:37'),
(384, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:37'),
(385, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:37'),
(386, 19, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:37'),
(387, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 1, '2026-08-14 06:53:45'),
(388, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:45'),
(389, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:45'),
(390, 19, 'PR Ready for Admin Review', 'Purchase Request 2026-08-019 has been reviewed by engineers and is ready for admin review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:53:45'),
(391, 5, 'PR Ready for Super Admin Representative Review', 'Purchase Request 2026-08-019 has been reviewed by admins and is ready for Super Admin Representative review', 'PR Review', 54, 'purchase_request', 0, '2026-08-14 06:54:04'),
(392, 8, 'PR Ready for Final Approval', 'Purchase Request 2026-08-019 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 54, 'purchase_request', 1, '2026-08-14 06:54:21'),
(393, 10, 'PR Ready for Final Approval', 'Purchase Request 2026-08-019 has been reviewed by all required reviewers and is ready for your final approval', 'PR Review', 54, 'purchase_request', 1, '2026-08-14 06:54:21'),
(394, 6, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 0, '2026-08-14 07:07:09'),
(395, 13, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 1, '2026-08-14 07:07:09'),
(396, 20, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 0, '2026-08-14 07:07:09'),
(397, 21, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 0, '2026-08-14 07:07:09'),
(398, 7, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 1, '2026-08-14 07:07:09'),
(399, 14, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 0, '2026-08-14 07:07:09'),
(400, 16, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 0, '2026-08-14 07:07:09'),
(401, 19, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 0, '2026-08-14 07:07:09'),
(402, 5, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 0, '2026-08-14 07:07:09'),
(403, 8, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 1, '2026-08-14 07:07:09'),
(404, 10, 'New PR Created', 'Purchase Request 2026-08-020 has been created and is ready for your review', 'PR Created', 55, 'purchase_request', 1, '2026-08-14 07:07:09'),
(405, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 1, '2026-08-14 07:07:53'),
(406, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:07:53'),
(407, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:07:53'),
(408, 19, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:07:53'),
(409, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 1, '2026-08-14 07:08:06'),
(410, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:06'),
(411, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:06'),
(412, 19, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:06'),
(413, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 1, '2026-08-14 07:08:14'),
(414, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:14'),
(415, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:14'),
(416, 19, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:14'),
(417, 7, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 1, '2026-08-14 07:08:22'),
(418, 14, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:22'),
(419, 16, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:22'),
(420, 19, 'PR Ready for Admin Review', 'Purchase Request 2026-08-020 has been reviewed by engineers and is ready for admin review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:22'),
(421, 5, 'PR Ready for Super Admin Representative Review', 'Purchase Request 2026-08-020 has been reviewed by admins and is ready for Super Admin Representative review', 'PR Review', 55, 'purchase_request', 0, '2026-08-14 07:08:30'),
(422, 8, 'PR Approved (< 10,000)', 'Purchase Request 2026-08-020 has been approved by Super Admin Representative and is ready for PO creation', 'PR Review', 55, 'purchase_request', 1, '2026-08-14 07:08:48'),
(423, 10, 'PR Approved (< 10,000)', 'Purchase Request 2026-08-020 has been approved by Super Admin Representative and is ready for PO creation', 'PR Review', 55, 'purchase_request', 1, '2026-08-14 07:08:48'),
(424, 6, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 0, '2026-08-27 02:30:42'),
(425, 12, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 1, '2026-08-27 02:30:42'),
(426, 20, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 0, '2026-08-27 02:30:42'),
(427, 21, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 0, '2026-08-27 02:30:42'),
(428, 7, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 1, '2026-08-27 02:30:42'),
(429, 14, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 0, '2026-08-27 02:30:42'),
(430, 16, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 0, '2026-08-27 02:30:42'),
(431, 19, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 0, '2026-08-27 02:30:42'),
(432, 5, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 0, '2026-08-27 02:30:42'),
(433, 8, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 1, '2026-08-27 02:30:42'),
(434, 10, 'New PR Created', 'Purchase Request 2026-08-021 has been created and is ready for your review', 'PR Created', 56, 'purchase_request', 1, '2026-08-27 02:30:42'),
(435, 13, 'PR Rejected', 'Your Purchase Request 2026-08-021 has been rejected', 'PR Rejected', 56, 'purchase_request', 1, '2026-08-27 02:32:47'),
(436, 13, 'PR Payment Schedule Reminder', 'PR 2026-08-021 has a payment due 1 day (Fri Aug 28 2026 00:00:00 GMT+0800 (Philippine Standard Time)) | Amount: PHP 1,234.00', 'Payment Reminder', 56, 'purchase_request', 1, '2026-08-27 02:43:16'),
(437, 7, 'PR Payment Schedule Reminder', 'PR 2026-08-021 has a payment due 1 day (Fri Aug 28 2026 00:00:00 GMT+0800 (Philippine Standard Time)) | Amount: PHP 1,234.00', 'Payment Reminder', 56, 'purchase_request', 1, '2026-08-27 02:43:16'),
(438, 14, 'PR Payment Schedule Reminder', 'PR 2026-08-021 has a payment due 1 day (Fri Aug 28 2026 00:00:00 GMT+0800 (Philippine Standard Time)) | Amount: PHP 1,234.00', 'Payment Reminder', 56, 'purchase_request', 0, '2026-08-27 02:43:16'),
(439, 16, 'PR Payment Schedule Reminder', 'PR 2026-08-021 has a payment due 1 day (Fri Aug 28 2026 00:00:00 GMT+0800 (Philippine Standard Time)) | Amount: PHP 1,234.00', 'Payment Reminder', 56, 'purchase_request', 0, '2026-08-27 02:43:16'),
(440, 19, 'PR Payment Schedule Reminder', 'PR 2026-08-021 has a payment due 1 day (Fri Aug 28 2026 00:00:00 GMT+0800 (Philippine Standard Time)) | Amount: PHP 1,234.00', 'Payment Reminder', 56, 'purchase_request', 0, '2026-08-27 02:43:16'),
(441, 8, 'PR Payment Schedule Reminder', 'PR 2026-08-021 has a payment due 1 day (Fri Aug 28 2026 00:00:00 GMT+0800 (Philippine Standard Time)) | Amount: PHP 1,234.00', 'Payment Reminder', 56, 'purchase_request', 1, '2026-08-27 02:43:16'),
(442, 10, 'PR Payment Schedule Reminder', 'PR 2026-08-021 has a payment due 1 day (Fri Aug 28 2026 00:00:00 GMT+0800 (Philippine Standard Time)) | Amount: PHP 1,234.00', 'Payment Reminder', 56, 'purchase_request', 1, '2026-08-27 02:43:16'),
(443, 6, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 0, '2026-08-27 03:15:48'),
(444, 12, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 1, '2026-08-27 03:15:48'),
(445, 13, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 1, '2026-08-27 03:15:48'),
(446, 20, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 0, '2026-08-27 03:15:48'),
(447, 7, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 1, '2026-08-27 03:15:48'),
(448, 14, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 0, '2026-08-27 03:15:48'),
(449, 16, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 0, '2026-08-27 03:15:48'),
(450, 19, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 0, '2026-08-27 03:15:48'),
(451, 5, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 0, '2026-08-27 03:15:48'),
(452, 8, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 1, '2026-08-27 03:15:48'),
(453, 10, 'New PR Created', 'Purchase Request 2026-08-022 has been created and is ready for your review', 'PR Created', 57, 'purchase_request', 1, '2026-08-27 03:15:48'),
(454, 21, 'PR Rejected', 'Your Purchase Request 2026-08-022 has been rejected', 'PR Rejected', 57, 'purchase_request', 0, '2026-08-27 03:16:23'),
(455, 6, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 0, '2026-08-27 03:31:45'),
(456, 13, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 1, '2026-08-27 03:31:45'),
(457, 20, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 0, '2026-08-27 03:31:45'),
(458, 21, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 0, '2026-08-27 03:31:45'),
(459, 7, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 1, '2026-08-27 03:31:45'),
(460, 14, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 0, '2026-08-27 03:31:45'),
(461, 16, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 0, '2026-08-27 03:31:45'),
(462, 19, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 0, '2026-08-27 03:31:45'),
(463, 5, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 0, '2026-08-27 03:31:45'),
(464, 8, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 1, '2026-08-27 03:31:45'),
(465, 10, 'New PR Created', 'Purchase Request 2026-08-023 has been created and is ready for your review', 'PR Created', 58, 'purchase_request', 1, '2026-08-27 03:31:45'),
(466, 12, 'PR Rejected', 'Your Purchase Request 2026-08-023 has been rejected', 'PR Rejected', 58, 'purchase_request', 1, '2026-08-27 03:35:12'),
(467, 6, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 0, '2026-09-02 03:22:44'),
(468, 13, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 0, '2026-09-02 03:22:44'),
(469, 20, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 0, '2026-09-02 03:22:44'),
(470, 21, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 0, '2026-09-02 03:22:44'),
(471, 7, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 1, '2026-09-02 03:22:45'),
(472, 14, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 0, '2026-09-02 03:22:45'),
(473, 16, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 0, '2026-09-02 03:22:45'),
(474, 19, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 0, '2026-09-02 03:22:45'),
(475, 5, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 0, '2026-09-02 03:22:45'),
(476, 8, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 1, '2026-09-02 03:22:45'),
(477, 10, 'New PR Created', 'Purchase Request 2026-09-024 has been created and is ready for your review', 'PR Created', 59, 'purchase_request', 0, '2026-09-02 03:22:45'),
(478, 12, 'PR Rejected', 'Your Purchase Request 2026-09-024 has been rejected', 'PR Rejected', 59, 'purchase_request', 1, '2026-09-02 03:24:58'),
(479, 6, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 0, '2026-09-02 05:40:18'),
(480, 13, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 0, '2026-09-02 05:40:18'),
(481, 20, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 0, '2026-09-02 05:40:18'),
(482, 21, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 0, '2026-09-02 05:40:18'),
(483, 7, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 1, '2026-09-02 05:40:18'),
(484, 14, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 0, '2026-09-02 05:40:18'),
(485, 16, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 0, '2026-09-02 05:40:18'),
(486, 19, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 0, '2026-09-02 05:40:18'),
(487, 5, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 0, '2026-09-02 05:40:18'),
(488, 8, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 1, '2026-09-02 05:40:18'),
(489, 10, 'New PR Created', 'Purchase Request 2026-09-025 has been created and is ready for your review', 'PR Created', 60, 'purchase_request', 0, '2026-09-02 05:40:18'),
(490, 12, 'PR Rejected', 'Your Purchase Request 2026-09-025 has been rejected', 'PR Rejected', 60, 'purchase_request', 0, '2026-09-02 05:41:10'),
(491, 8, 'Item Request Processed', 'Purchase Request 2026-09-026 has been processed by ELAINE and is ready for your approval.', '/dashboard/purchase-requests/61', NULL, NULL, 0, '2026-09-03 08:11:09');
INSERT INTO `notifications` (`id`, `recipient_id`, `title`, `message`, `type`, `related_id`, `related_type`, `is_read`, `created_at`) VALUES
(492, 10, 'Item Request Processed', 'Purchase Request 2026-09-026 has been processed by ELAINE and is ready for your approval.', '/dashboard/purchase-requests/61', NULL, NULL, 0, '2026-09-03 08:11:09'),
(493, 6, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(494, 12, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(495, 20, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(496, 21, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(497, 7, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 1, '2026-09-03 08:20:52'),
(498, 14, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(499, 16, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(500, 19, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(501, 5, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(502, 8, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(503, 10, 'New PR Created', 'Purchase Request 2026-09-027 has been created and is ready for your review', 'PR Created', 62, 'purchase_request', 0, '2026-09-03 08:20:52'),
(504, 5, 'Item Request Processed', 'Purchase Request 2026-09-027 has been processed by ELAINE and is ready for your review.', '/dashboard/purchase-requests/62', NULL, NULL, 0, '2026-09-03 08:21:34'),
(505, 6, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(506, 12, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(507, 20, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(508, 21, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(509, 7, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 1, '2026-09-03 08:33:01'),
(510, 14, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(511, 16, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(512, 19, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(513, 5, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(514, 8, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(515, 10, 'New PR Created', 'Purchase Request 2026-09-028 has been created and is ready for your review', 'PR Created', 63, 'purchase_request', 0, '2026-09-03 08:33:01'),
(516, 5, 'Item Request Processed', 'Purchase Request 2026-09-028 has been processed by ELAINE and is ready for your review.', '/dashboard/purchase-requests/63', NULL, NULL, 0, '2026-09-03 08:35:33'),
(517, 6, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:25'),
(518, 12, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:25'),
(519, 20, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:25'),
(520, 21, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:25'),
(521, 7, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 1, '2026-09-03 08:59:25'),
(522, 14, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:25'),
(523, 16, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:25'),
(524, 19, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:25'),
(525, 5, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:25'),
(526, 8, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:26'),
(527, 10, 'New PR Created', 'Purchase Request 2026-09-029 has been created and is ready for your review', 'PR Created', 64, 'purchase_request', 0, '2026-09-03 08:59:26'),
(528, 8, 'New PR Created', 'Purchase Request 2026-09-030 has been created and is ready for your review', 'PR Created', 65, 'purchase_request', 0, '2026-09-04 01:00:34'),
(529, 10, 'New PR Created', 'Purchase Request 2026-09-030 has been created and is ready for your review', 'PR Created', 65, 'purchase_request', 0, '2026-09-04 01:00:34'),
(530, 6, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59'),
(531, 12, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59'),
(532, 13, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59'),
(533, 20, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59'),
(534, 7, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 1, '2026-09-04 01:16:59'),
(535, 14, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59'),
(536, 16, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59'),
(537, 19, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59'),
(538, 5, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59'),
(539, 8, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59'),
(540, 10, 'New PR Created', 'Purchase Request 2026-09-031 has been created and is ready for your review', 'PR Created', 66, 'purchase_request', 0, '2026-09-04 01:16:59');

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_schedule_reminder_logs`
--

INSERT INTO `payment_schedule_reminder_logs` (`id`, `schedule_id`, `reminder_type`, `sent_at`) VALUES
(1, 1, 'D_MINUS_1', '2026-08-27 02:43:16');

-- --------------------------------------------------------

--
-- Table structure for table `po_admin_reviews`
--

DROP TABLE IF EXISTS `po_admin_reviews`;
CREATE TABLE IF NOT EXISTS `po_admin_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `review_status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `review_comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_current` tinyint(1) DEFAULT '1',
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `po_id` (`po_id`),
  KEY `reviewer_id` (`reviewer_id`)
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
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(165, 173, 4, 1000.00, 1.00, 1000.00, 35, 69, 'ETN-2026-04-001', 'MTN-2026-04-001', '2026-04-16', 'Auto-recorded from PO ETN-2026-04-001', NULL, '2026-04-16 05:27:43', '2026-04-16 05:27:43'),
(166, 5, 47, 12.00, 1.00, 12.00, 2, 48, 'EAN-2026-08-001', '2026-08-013', '2026-08-13', 'Auto-recorded from PO EAN-2026-08-001', NULL, '2026-08-13 01:56:32', '2026-08-13 01:56:32');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `po_number`, `purchase_request_id`, `service_request_id`, `supplier_id`, `prepared_by`, `total_amount`, `po_date`, `expected_delivery_date`, `actual_delivery_date`, `status`, `created_at`, `updated_at`, `place_of_delivery`, `delivery_term`, `payment_term`, `project`, `notes`, `order_number`, `po_type`, `parent_po_id`, `installment_schedule_id`, `scheduled_payment_date`, `scheduled_amount`) VALUES
(1, 'PO-2026-0001', 1, NULL, 10, 2, 75250.00, '2026-05-22', '2026-05-29', NULL, 'Approved', '2026-05-22 02:41:53', '2026-05-29 01:45:51', 'Main Warehouse, Site A', 'COD', 'CASH', 'Project Alpha Phase 1', 'Standard mock order for system testing and procurement validation.', 'ORD-99541', 'purchase_order', NULL, NULL, NULL, NULL),
(2, 'EAN-2026-08-001', 48, NULL, 47, 7, 12.00, '2026-08-13', '2026-08-14', NULL, 'Pending Approval', '2026-08-13 01:56:32', '2026-08-13 01:56:32', NULL, 'COD', 'CASH', 'BCDA - Admin', NULL, '393859493', 'purchase_order', NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `purchase_request_item_id`, `item_id`, `quantity`, `unit_price`, `total_price`, `created_at`) VALUES
(1, 2, 50, 5, 1, 12.00, 12.00, '2026-08-13 01:56:32');

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
  `status` enum('Draft','Pending','Pending Admin Processing','Under Admin Review','For Admin Processing','For Procurement Review','For Engineer Review','For Admin Review','For Super Admin Rep Review','For Super Admin Final Approval','On Hold','For Purchase','PO Created','Payment Request Created','Completed','Rejected','Cancelled','Received') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
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
  `is_bypassed` tinyint(1) DEFAULT '0',
  `bypassed_by` int DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pr_number` (`pr_number`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`),
  KEY `supplier_id` (`supplier_id`),
  KEY `payment_basis` (`payment_basis`),
  KEY `purchase_requests_payment_terms_set_by_fk` (`payment_terms_set_by`),
  KEY `bypassed_by` (`bypassed_by`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_requests`
--

INSERT INTO `purchase_requests` (`id`, `pr_number`, `requested_by`, `purpose`, `remarks`, `date_needed`, `project`, `project_address`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `total_amount`, `created_at`, `updated_at`, `supplier_id`, `supplier_address`, `order_number`, `payment_basis`, `payment_terms_code`, `payment_terms_note`, `payment_terms_set_by`, `payment_terms_set_at`, `supplier_name`, `accreditation_files`, `supplier_accredited`, `is_bypassed`, `bypassed_by`, `processed_by`) VALUES
(36, '2026-06-001', 5, 'hsfdfg fgh', NULL, '2026-06-12', 'Sto. Rosario', 'Sto. Rosario, San Juan, La Union', 'For Purchase', 8, '2026-06-05 06:16:40', NULL, 396.00, '2026-06-05 06:14:35', '2026-06-05 06:16:40', NULL, 'fd', '299269388', 'non_debt', NULL, NULL, NULL, NULL, 'fh', '[{\"filename\":\"accreditation_files-1780640075481-727453544.xlsx\",\"originalname\":\"PR-2026-06-023.xlsx\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1780640075481-727453544.xlsx\",\"size\":52165,\"mimetype\":\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\",\"uploaded_at\":\"2026-06-05T06:14:35.937Z\"}]', 0, 0, NULL, NULL),
(38, '2026-06-003', 5, 'qwgwertgsergs', NULL, '2026-07-03', 'BCDA - CCA', 'Poro point, San Fernando City, La Union', 'For Purchase', 8, '2026-06-19 03:55:19', NULL, 21.00, '2026-06-08 08:02:34', '2026-06-19 03:55:19', NULL, 'sdfgsdg', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'sdsdfgsdfg', '[{\"filename\":\"accreditation_files-1780905754493-237260569.pdf\",\"originalname\":\"RESUME._103654.pdf\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1780905754493-237260569.pdf\",\"size\":596275,\"mimetype\":\"application/pdf\",\"uploaded_at\":\"2026-06-08T08:02:34.501Z\"}]', 0, 0, NULL, NULL),
(40, '2026-06-005', 16, 'dfgsdfg', NULL, '2026-07-07', 'Panicsican', 'Panicsican, San Juan, La Union', 'For Purchase', 8, '2026-06-19 03:55:18', NULL, 0.00, '2026-06-08 08:07:04', '2026-06-19 03:55:18', NULL, 'dsfgf', '159166591', 'non_debt', NULL, NULL, NULL, NULL, 'sdg', '[{\"filename\":\"accreditation_files-1780906024109-892457528.docx\",\"originalname\":\"files-1780032565780-641676311.docx\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1780906024109-892457528.docx\",\"size\":32026,\"mimetype\":\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\",\"uploaded_at\":\"2026-06-08T08:07:04.114Z\"}]', 0, 0, NULL, NULL),
(41, '2026-06-006', 7, 'wasfASFD DWSFEW EWF WW', NULL, '2026-06-22', 'Sto. Rosario', 'Sto. Rosario, San Juan, La Union', 'For Purchase', 8, '2026-06-19 03:55:15', NULL, 1050.00, '2026-06-19 03:52:19', '2026-06-19 03:55:15', NULL, 'Mangaan, Santol, La Union', '299269388', 'non_debt', NULL, NULL, NULL, NULL, 'This is just for testing', '[{\"filename\":\"accreditation_files-1781841139156-673085472.xlsx\",\"originalname\":\"REQUEST-FORM.xlsx\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1781841139156-673085472.xlsx\",\"size\":62304,\"mimetype\":\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\",\"uploaded_at\":\"2026-06-19T03:52:19.334Z\"}]', 0, 0, NULL, NULL),
(42, '2026-08-007', 5, 'Pang pasita baby', NULL, '2026-08-21', 'BCDA - CCTV', 'Poro point, San Fernando City, La Union', 'For Purchase', 8, '2026-08-12 02:45:02', NULL, 4910.98, '2026-08-12 02:29:38', '2026-08-12 02:45:02', NULL, 'San Juan, La Union', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'Ni Bombo Daniel ijay igi kalsada', NULL, 0, 0, NULL, NULL),
(43, '2026-08-008', 5, 'Para jay balay para bagyo', '', '2026-08-14', 'BCDA - Control Tower', 'Poro point, San Fernando City, La Union', 'Rejected', 8, '2026-08-27 02:29:28', NULL, 1324.00, '2026-08-12 03:23:21', '2026-08-27 02:29:28', NULL, 'Ijay igdi lacong', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'NI mang dante', NULL, 0, 0, NULL, NULL),
(45, '2026-08-010', 5, 'AWSFASDF SAF', '', '2026-08-14', 'BCDA - Control Tower', 'Poro point, San Fernando City, La Union', 'Rejected', NULL, NULL, 'ADXAs', 123.00, '2026-08-12 06:56:28', '2026-08-14 00:31:09', NULL, 'asdfasdf', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1, 0, NULL, NULL),
(47, '2026-08-012', 7, 'QWAFD', NULL, '2026-08-20', 'BCDA - Admin', 'Poro point, San Fernando City, La Union', 'For Purchase', 8, '2026-08-13 01:43:25', NULL, 12.00, '2026-08-13 01:42:45', '2026-08-13 01:43:25', NULL, 'QDasd', '393859493', 'non_debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1, 0, NULL, NULL),
(48, '2026-08-013', 7, 'asdf', NULL, '2026-08-22', 'BCDA - Admin', 'Poro point, San Fernando City, La Union', 'PO Created', 8, '2026-08-13 01:54:19', NULL, 12.00, '2026-08-13 01:53:35', '2026-08-13 01:56:32', NULL, 'asd', '393859493', 'debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1, 0, NULL, NULL),
(49, '2026-08-014', 7, 'asda', '', '2026-08-22', 'BCDA - Admin', 'Poro point, San Fernando City, La Union', 'Rejected', NULL, NULL, 'QASAs', 123.00, '2026-08-14 00:30:56', '2026-08-14 00:31:39', NULL, 'asdas', '393859493', 'debt', NULL, NULL, NULL, NULL, 'as', NULL, 0, 0, NULL, NULL),
(50, '2026-08-015', 12, 'testing', '', '2026-08-29', 'BCDA - Admin', 'Poro point, San Fernando City, La Union', 'For Purchase', NULL, NULL, NULL, 6170.00, '2026-08-14 05:01:05', '2026-08-14 05:02:38', NULL, 'Bacnotan, La Union', '393859493', 'debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1, 0, NULL, NULL),
(51, '2026-08-016', 7, 'sadfsdwaf', '', '2026-08-28', 'BCDA - Admin', 'Poro point, San Fernando City, La Union', 'For Purchase', NULL, NULL, NULL, 708.00, '2026-08-14 05:04:03', '2026-08-14 05:04:34', NULL, 'san juan, la union', '393859493', 'debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1, 0, NULL, NULL),
(54, '2026-08-019', 12, 'zdfb', NULL, '2026-08-27', 'BCDA - Control Tower', 'Poro point, San Fernando City, La Union', 'For Purchase', 8, '2026-08-14 06:57:53', NULL, 10000.00, '2026-08-14 06:52:32', '2026-08-14 06:57:53', NULL, 'asdfsafsadfdsf', '393859493', 'debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1, 0, NULL, NULL),
(55, '2026-08-020', 12, 'aSF', '', '2026-08-28', 'BCDA - Admin', 'Poro point, San Fernando City, La Union', 'For Purchase', NULL, NULL, NULL, 12.00, '2026-08-14 07:07:09', '2026-08-14 07:08:48', NULL, 'asfsdf', '393859493', 'debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1, 0, NULL, NULL),
(56, '2026-08-021', 13, 'afasf', '', '2026-08-28', 'Panicsican', 'Panicsican, San Juan, La Union', '', NULL, NULL, NULL, 1234.00, '2026-08-27 02:30:42', '2026-08-27 02:44:50', NULL, NULL, '159166591', 'debt', NULL, NULL, NULL, NULL, 'asdfa', '[{\"filename\":\"accreditation_files-1787797842077-186972126.jpg\",\"originalname\":\"Gemini_Generated_Image_g5mbh7g5mbh7g5mb (1).jpg\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1787797842077-186972126.jpg\",\"size\":2640436,\"mimetype\":\"image/jpeg\",\"uploaded_at\":\"2026-08-27T02:30:42.095Z\"}]', 1, 0, NULL, NULL),
(57, '2026-08-022', 21, 'for testing', '', '2026-09-02', 'Sto. Rosario', 'Sto. Rosario, San Juan, La Union', 'Rejected', NULL, NULL, 'mali ulitin mo, i-edit mo', 534.00, '2026-08-27 03:15:48', '2026-08-27 03:16:23', NULL, 'santol, la union', '299269388', 'debt', NULL, NULL, NULL, NULL, 'asdfa', '[{\"filename\":\"accreditation_files-1787800548037-580315619.png\",\"originalname\":\"ChatGPT Image Aug 22, 2026, 02_42_52 PM.png\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1787800548037-580315619.png\",\"size\":2121105,\"mimetype\":\"image/png\",\"uploaded_at\":\"2026-08-27T03:15:48.048Z\"}]', 1, 0, NULL, NULL),
(58, '2026-08-023', 12, 'This is test', '', '2026-09-05', 'Sto. Rosario', 'Sto. Rosario, San Juan, La Union', 'Rejected', NULL, NULL, 'ulitin', 4559.98, '2026-08-27 03:31:45', '2026-08-27 03:35:12', NULL, 'bagulin, la union', '299269388', 'debt', NULL, NULL, NULL, NULL, 'asdfa', '[{\"filename\":\"accreditation_files-1787801505551-619821284.jpg\",\"originalname\":\"Gemini_Generated_Image_g5mbh7g5mbh7g5mb (1).jpg\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1787801505551-619821284.jpg\",\"size\":2640436,\"mimetype\":\"image/jpeg\",\"uploaded_at\":\"2026-08-27T03:31:45.562Z\"}]', 1, 0, NULL, NULL),
(59, '2026-09-024', 12, 'For the hanging cabinet', '', '2026-09-04', 'Sto. Rosario', 'Sto. Rosario, San Juan, La Union', 'Rejected', NULL, NULL, 'REJECTED', 50798.00, '2026-09-02 03:22:44', '2026-09-02 03:24:58', NULL, 'Pias, San Fernando La Union', '299269388', 'debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1, 0, NULL, NULL),
(60, '2026-09-025', 12, 'for cabinetry and fabircation', '', '2026-09-30', 'Pias - Sundara', NULL, 'Rejected', NULL, NULL, 'madii', 2809.89, '2026-09-02 05:40:18', '2026-09-02 05:41:10', NULL, 'Supplier address', '228984422', 'debt', NULL, NULL, NULL, NULL, 'asdfa', NULL, 1, 0, NULL, NULL),
(61, '2026-09-026', 13, 'Pang print', 'none', '2026-09-03', 'Sto. Rosario', NULL, 'For Super Admin Final Approval', NULL, NULL, NULL, 123.00, '2026-09-03 07:19:47', '2026-09-03 08:11:09', 46, 'fd', NULL, 'non_debt', NULL, NULL, NULL, NULL, 'fh', NULL, 0, 0, NULL, NULL),
(62, '2026-09-027', 13, 'pangprint', '', '2026-09-03', 'Sto. Rosario', NULL, '', NULL, NULL, NULL, 12555.00, '2026-09-03 08:20:52', '2026-09-03 08:21:34', 67, 'San Juan, La Union', NULL, 'non_debt', NULL, NULL, NULL, NULL, 'Ni Bombo Daniel ijay igi kalsada', NULL, NULL, 0, NULL, NULL),
(63, '2026-09-028', 13, 'For office supplies', 'This is the remarks', '2026-09-06', 'MAIN OFFICE', NULL, '', NULL, NULL, NULL, 12815.00, '2026-09-03 08:33:01', '2026-09-03 08:35:33', 68, 'Ijay igdi lacong', NULL, 'non_debt', NULL, NULL, NULL, NULL, 'NI mang dante', NULL, NULL, 0, NULL, NULL),
(64, '2026-09-029', 13, 'asdasasds', '', '2026-09-03', 'MAIN OFFICE', NULL, 'For Admin Processing', NULL, NULL, NULL, 0.00, '2026-09-03 08:59:25', '2026-09-03 08:59:25', NULL, NULL, NULL, 'debt', NULL, NULL, NULL, NULL, 'TBD', NULL, NULL, 0, NULL, NULL),
(65, '2026-09-030', 5, 'opawehifeasrog', '', '2026-09-04', 'BCDA - CCA', NULL, 'For Admin Processing', NULL, NULL, NULL, 0.00, '2026-09-04 01:00:34', '2026-09-04 01:00:34', NULL, NULL, NULL, 'debt', NULL, NULL, NULL, NULL, 'TBD', NULL, NULL, 0, NULL, NULL),
(66, '2026-09-031', 21, 'For testing', 'wwala', '2026-09-04', 'BCDA - Admin', NULL, 'For Admin Processing', NULL, NULL, NULL, 0.00, '2026-09-04 01:16:59', '2026-09-04 01:16:59', NULL, NULL, NULL, 'debt', NULL, NULL, NULL, NULL, 'TBD', NULL, NULL, 0, NULL, NULL);

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
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_request_id` (`purchase_request_id`),
  KEY `item_id` (`item_id`),
  KEY `received_by` (`received_by`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_request_items`
--

INSERT INTO `purchase_request_items` (`id`, `purchase_request_id`, `item_id`, `quantity`, `unit_price`, `total_price`, `unit`, `remarks`, `status`, `received_by`, `received_at`, `created_at`, `image_url`) VALUES
(35, 36, 5, 3, 132.00, 396.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-05 06:14:35', NULL),
(37, 38, 6, 1, 21.00, 21.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-08 08:02:34', NULL),
(39, 40, 5, 1, 0.00, 0.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-08 08:07:04', NULL),
(40, 41, 6, 1, 525.00, 525.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-19 03:52:19', NULL),
(41, 41, 24, 1, 525.00, 525.00, NULL, NULL, 'Pending', NULL, NULL, '2026-06-19 03:52:19', NULL),
(42, 42, 22, 1, 1231.00, 1231.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 02:29:38', NULL),
(43, 42, 5, 1, 3245.00, 3245.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 02:29:38', NULL),
(44, 42, 6, 1, 434.98, 434.98, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 02:29:38', NULL),
(45, 43, 5, 1, 1324.00, 1324.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 03:23:21', NULL),
(47, 45, 5, 1, 123.00, 123.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-12 06:56:28', NULL),
(49, 47, 6, 1, 12.00, 12.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-13 01:42:45', NULL),
(50, 48, 5, 1, 12.00, 12.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-13 01:53:35', NULL),
(51, 49, 22, 1, 123.00, 123.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-14 00:30:56', NULL),
(52, 50, 5, 5, 1234.00, 6170.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-14 05:01:05', NULL),
(53, 51, 22, 1, 12.00, 12.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-14 05:04:03', NULL),
(54, 51, 5, 3, 232.00, 696.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-14 05:04:03', NULL),
(61, 54, 6, 1, 10000.00, 10000.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-14 06:52:32', NULL),
(62, 55, 6, 1, 12.00, 12.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-14 07:07:09', NULL),
(64, 56, 5, 1, 1234.00, 1234.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-27 02:33:54', NULL),
(65, 57, 5, 1, 534.00, 534.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-27 03:15:48', NULL),
(66, 58, 6, 1, 235.00, 235.00, NULL, NULL, 'Pending', NULL, NULL, '2026-08-27 03:31:45', NULL),
(67, 58, 5, 1, 4324.98, 4324.98, NULL, NULL, 'Pending', NULL, NULL, '2026-08-27 03:31:45', NULL),
(68, 59, 5, 6, 173.00, 1038.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-02 03:22:44', NULL),
(69, 59, 6, 2, 234.00, 468.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-02 03:22:44', NULL),
(70, 59, 22, 4, 12323.00, 49292.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-02 03:22:44', NULL),
(71, 60, 5, 1, 2342.00, 2342.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-02 05:40:18', NULL),
(72, 60, 6, 1, 233.98, 233.98, NULL, NULL, 'Pending', NULL, NULL, '2026-09-02 05:40:18', NULL),
(73, 60, 22, 1, 233.91, 233.91, NULL, NULL, 'Pending', NULL, NULL, '2026-09-02 05:40:18', NULL),
(74, 61, 25, 1, 123.00, 123.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-03 07:19:47', NULL),
(75, 62, 5, 1, 123.00, 123.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-03 08:20:52', NULL),
(76, 62, 22, 1, 12432.00, 12432.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-03 08:20:52', NULL),
(77, 63, 22, 1, 143.00, 143.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-03 08:33:01', NULL),
(78, 63, 18, 1, 1456.00, 1456.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-03 08:33:01', NULL),
(79, 63, 6, 1, 5463.00, 5463.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-03 08:33:01', NULL),
(80, 63, 21, 1, 5453.00, 5453.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-03 08:33:01', NULL),
(81, 63, 17, 1, 300.00, 300.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-03 08:33:01', NULL),
(82, 64, 25, 1, 0.00, 0.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-03 08:59:25', NULL),
(83, 65, 14, 1, 0.00, 0.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-04 01:00:34', NULL),
(84, 66, 24, 1, 0.00, 0.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-04 01:16:59', NULL),
(85, 66, 6, 1, 0.00, 0.00, NULL, NULL, 'Pending', NULL, NULL, '2026-09-04 01:16:59', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_request_payment_schedules`
--

INSERT INTO `purchase_request_payment_schedules` (`id`, `purchase_request_id`, `payment_date`, `amount`, `note`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 56, '2026-08-28', 1234.00, NULL, 13, '2026-08-27 02:33:54', '2026-08-27 02:33:54');

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
) ENGINE=InnoDB AUTO_INCREMENT=446 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_request_reviews`
--

INSERT INTO `purchase_request_reviews` (`id`, `purchase_request_id`, `reviewer_id`, `review_status`, `review_comment`, `reviewed_at`, `created_at`) VALUES
(204, 36, 6, 'approved', NULL, '2026-06-05 06:16:26', '2026-06-05 06:14:35'),
(205, 36, 12, 'approved', NULL, '2026-06-05 06:15:44', '2026-06-05 06:14:35'),
(206, 36, 13, 'approved', NULL, '2026-06-05 06:15:59', '2026-06-05 06:14:35'),
(207, 36, 8, 'pending', NULL, NULL, '2026-06-05 06:14:35'),
(208, 36, 10, 'pending', NULL, NULL, '2026-06-05 06:14:35'),
(224, 38, 6, 'approved', NULL, '2026-06-08 08:03:21', '2026-06-08 08:02:34'),
(225, 38, 12, 'approved', NULL, '2026-06-08 08:02:57', '2026-06-08 08:02:34'),
(226, 38, 13, 'approved', NULL, '2026-06-08 08:03:11', '2026-06-08 08:02:34'),
(227, 38, 8, 'pending', NULL, NULL, '2026-06-08 08:02:34'),
(228, 38, 10, 'pending', NULL, NULL, '2026-06-08 08:02:34'),
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
(272, 45, 6, 'approved', NULL, '2026-08-12 06:57:39', '2026-08-12 06:56:28'),
(273, 45, 12, 'approved', NULL, '2026-08-12 06:56:44', '2026-08-12 06:56:28'),
(274, 45, 13, 'approved', NULL, '2026-08-12 06:57:18', '2026-08-12 06:56:28'),
(275, 45, 7, 'pending', NULL, NULL, '2026-08-12 06:56:28'),
(276, 45, 14, 'rejected', 'ADXAs', '2026-08-14 00:31:09', '2026-08-12 06:56:28'),
(277, 45, 16, 'pending', NULL, NULL, '2026-08-12 06:56:28'),
(278, 45, 8, 'pending', NULL, NULL, '2026-08-12 06:56:28'),
(279, 45, 10, 'pending', NULL, NULL, '2026-08-12 06:56:28'),
(288, 47, 14, 'approved', NULL, '2026-08-13 01:42:54', '2026-08-13 01:42:45'),
(289, 47, 16, 'approved', NULL, '2026-08-13 01:43:04', '2026-08-13 01:42:45'),
(290, 47, 8, 'pending', NULL, NULL, '2026-08-13 01:42:45'),
(291, 47, 10, 'pending', NULL, NULL, '2026-08-13 01:42:45'),
(292, 48, 14, 'approved', NULL, '2026-08-13 01:53:52', '2026-08-13 01:53:35'),
(293, 48, 16, 'approved', NULL, '2026-08-13 01:54:01', '2026-08-13 01:53:35'),
(294, 48, 8, 'pending', NULL, NULL, '2026-08-13 01:53:35'),
(295, 48, 10, 'pending', NULL, NULL, '2026-08-13 01:53:35'),
(296, 49, 14, 'rejected', 'QASAs', '2026-08-14 00:31:39', '2026-08-14 00:31:25'),
(297, 49, 16, 'pending', NULL, NULL, '2026-08-14 00:31:25'),
(298, 49, 8, 'pending', NULL, NULL, '2026-08-14 00:31:25'),
(299, 49, 10, 'pending', NULL, NULL, '2026-08-14 00:31:25'),
(300, 50, 13, 'approved', NULL, '2026-08-14 05:01:19', '2026-08-14 05:01:05'),
(301, 50, 7, 'approved', NULL, '2026-08-14 05:01:40', '2026-08-14 05:01:05'),
(302, 50, 14, 'approved', NULL, '2026-08-14 05:01:49', '2026-08-14 05:01:05'),
(303, 50, 16, 'approved', NULL, '2026-08-14 05:01:58', '2026-08-14 05:01:05'),
(304, 50, 5, 'approved', NULL, '2026-08-14 05:02:38', '2026-08-14 05:01:05'),
(305, 50, 8, 'pending', NULL, NULL, '2026-08-14 05:01:05'),
(306, 50, 10, 'pending', NULL, NULL, '2026-08-14 05:01:05'),
(307, 51, 14, 'approved', NULL, '2026-08-14 05:04:12', '2026-08-14 05:04:03'),
(308, 51, 16, 'approved', NULL, '2026-08-14 05:04:18', '2026-08-14 05:04:03'),
(309, 51, 5, 'approved', NULL, '2026-08-14 05:04:34', '2026-08-14 05:04:03'),
(310, 51, 8, 'pending', NULL, NULL, '2026-08-14 05:04:03'),
(311, 51, 10, 'pending', NULL, NULL, '2026-08-14 05:04:03'),
(323, 54, 6, 'approved', NULL, '2026-08-14 06:52:58', '2026-08-14 06:52:32'),
(324, 54, 13, 'approved', NULL, '2026-08-14 06:52:46', '2026-08-14 06:52:32'),
(325, 54, 20, 'approved', NULL, '2026-08-14 06:53:08', '2026-08-14 06:52:32'),
(326, 54, 21, 'approved', NULL, '2026-08-14 06:53:18', '2026-08-14 06:52:32'),
(327, 54, 7, 'approved', NULL, '2026-08-14 06:53:29', '2026-08-14 06:52:32'),
(328, 54, 14, 'approved', NULL, '2026-08-14 06:53:37', '2026-08-14 06:52:32'),
(329, 54, 16, 'approved', NULL, '2026-08-14 06:53:45', '2026-08-14 06:52:32'),
(330, 54, 19, 'approved', NULL, '2026-08-14 06:54:04', '2026-08-14 06:52:32'),
(331, 54, 5, 'approved', NULL, '2026-08-14 06:54:21', '2026-08-14 06:52:32'),
(332, 54, 8, 'pending', NULL, NULL, '2026-08-14 06:52:32'),
(333, 54, 10, 'pending', NULL, NULL, '2026-08-14 06:52:32'),
(334, 55, 6, 'approved', NULL, '2026-08-14 07:07:53', '2026-08-14 07:07:09'),
(335, 55, 13, 'approved', NULL, '2026-08-14 07:07:23', '2026-08-14 07:07:09'),
(336, 55, 20, 'approved', NULL, '2026-08-14 07:07:35', '2026-08-14 07:07:09'),
(337, 55, 21, 'approved', NULL, '2026-08-14 07:07:43', '2026-08-14 07:07:09'),
(338, 55, 7, 'approved', NULL, '2026-08-14 07:08:06', '2026-08-14 07:07:09'),
(339, 55, 14, 'approved', NULL, '2026-08-14 07:08:22', '2026-08-14 07:07:09'),
(340, 55, 16, 'approved', NULL, '2026-08-14 07:08:14', '2026-08-14 07:07:09'),
(341, 55, 19, 'approved', NULL, '2026-08-14 07:08:30', '2026-08-14 07:07:09'),
(342, 55, 5, 'approved', NULL, '2026-08-14 07:08:48', '2026-08-14 07:07:09'),
(343, 55, 8, 'pending', NULL, NULL, '2026-08-14 07:07:09'),
(344, 55, 10, 'pending', NULL, NULL, '2026-08-14 07:07:09'),
(345, 56, 6, 'pending', NULL, NULL, '2026-08-27 02:30:42'),
(346, 56, 12, 'approved', NULL, '2026-08-27 02:31:44', '2026-08-27 02:30:42'),
(347, 56, 20, 'pending', NULL, NULL, '2026-08-27 02:30:42'),
(348, 56, 21, 'rejected', 'mali', '2026-08-27 02:32:47', '2026-08-27 02:30:42'),
(349, 56, 7, 'pending', NULL, NULL, '2026-08-27 02:30:42'),
(350, 56, 14, 'pending', NULL, NULL, '2026-08-27 02:30:42'),
(351, 56, 16, 'pending', NULL, NULL, '2026-08-27 02:30:42'),
(352, 56, 19, 'pending', NULL, NULL, '2026-08-27 02:30:42'),
(353, 56, 5, 'pending', NULL, NULL, '2026-08-27 02:30:42'),
(354, 56, 8, 'pending', NULL, NULL, '2026-08-27 02:30:42'),
(355, 56, 10, 'pending', NULL, NULL, '2026-08-27 02:30:42'),
(356, 57, 6, 'pending', NULL, NULL, '2026-08-27 03:15:48'),
(357, 57, 12, 'rejected', 'mali ulitin mo, i-edit mo', '2026-08-27 03:16:23', '2026-08-27 03:15:48'),
(358, 57, 13, 'approved', NULL, '2026-08-27 03:16:07', '2026-08-27 03:15:48'),
(359, 57, 20, 'pending', NULL, NULL, '2026-08-27 03:15:48'),
(360, 57, 7, 'pending', NULL, NULL, '2026-08-27 03:15:48'),
(361, 57, 14, 'pending', NULL, NULL, '2026-08-27 03:15:48'),
(362, 57, 16, 'pending', NULL, NULL, '2026-08-27 03:15:48'),
(363, 57, 19, 'pending', NULL, NULL, '2026-08-27 03:15:48'),
(364, 57, 5, 'pending', NULL, NULL, '2026-08-27 03:15:48'),
(365, 57, 8, 'pending', NULL, NULL, '2026-08-27 03:15:48'),
(366, 57, 10, 'pending', NULL, NULL, '2026-08-27 03:15:48'),
(367, 58, 6, 'pending', NULL, NULL, '2026-08-27 03:31:45'),
(368, 58, 13, 'approved', NULL, '2026-08-27 03:34:58', '2026-08-27 03:31:45'),
(369, 58, 20, 'pending', NULL, NULL, '2026-08-27 03:31:45'),
(370, 58, 21, 'rejected', 'ulitin', '2026-08-27 03:35:12', '2026-08-27 03:31:45'),
(371, 58, 7, 'pending', NULL, NULL, '2026-08-27 03:31:45'),
(372, 58, 14, 'pending', NULL, NULL, '2026-08-27 03:31:45'),
(373, 58, 16, 'pending', NULL, NULL, '2026-08-27 03:31:45'),
(374, 58, 19, 'pending', NULL, NULL, '2026-08-27 03:31:45'),
(375, 58, 5, 'pending', NULL, NULL, '2026-08-27 03:31:45'),
(376, 58, 8, 'pending', NULL, NULL, '2026-08-27 03:31:45'),
(377, 58, 10, 'pending', NULL, NULL, '2026-08-27 03:31:45'),
(378, 59, 6, 'pending', NULL, NULL, '2026-09-02 03:22:44'),
(379, 59, 13, 'approved', NULL, '2026-09-02 03:23:38', '2026-09-02 03:22:44'),
(380, 59, 20, 'pending', NULL, NULL, '2026-09-02 03:22:44'),
(381, 59, 21, 'rejected', 'REJECTED', '2026-09-02 03:24:58', '2026-09-02 03:22:44'),
(382, 59, 7, 'pending', NULL, NULL, '2026-09-02 03:22:44'),
(383, 59, 14, 'pending', NULL, NULL, '2026-09-02 03:22:44'),
(384, 59, 16, 'pending', NULL, NULL, '2026-09-02 03:22:44'),
(385, 59, 19, 'pending', NULL, NULL, '2026-09-02 03:22:44'),
(386, 59, 5, 'pending', NULL, NULL, '2026-09-02 03:22:44'),
(387, 59, 8, 'pending', NULL, NULL, '2026-09-02 03:22:44'),
(388, 59, 10, 'pending', NULL, NULL, '2026-09-02 03:22:44'),
(389, 60, 6, 'pending', NULL, NULL, '2026-09-02 05:40:18'),
(390, 60, 13, 'rejected', 'madii', '2026-09-02 05:41:10', '2026-09-02 05:40:18'),
(391, 60, 20, 'pending', NULL, NULL, '2026-09-02 05:40:18'),
(392, 60, 21, 'approved', NULL, '2026-09-02 05:40:51', '2026-09-02 05:40:18'),
(393, 60, 7, 'pending', NULL, NULL, '2026-09-02 05:40:18'),
(394, 60, 14, 'pending', NULL, NULL, '2026-09-02 05:40:18'),
(395, 60, 16, 'pending', NULL, NULL, '2026-09-02 05:40:18'),
(396, 60, 19, 'pending', NULL, NULL, '2026-09-02 05:40:18'),
(397, 60, 5, 'pending', NULL, NULL, '2026-09-02 05:40:18'),
(398, 60, 8, 'pending', NULL, NULL, '2026-09-02 05:40:18'),
(399, 60, 10, 'pending', NULL, NULL, '2026-09-02 05:40:18'),
(400, 62, 6, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(401, 62, 12, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(402, 62, 20, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(403, 62, 21, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(404, 62, 7, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(405, 62, 14, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(406, 62, 16, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(407, 62, 19, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(408, 62, 5, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(409, 62, 8, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(410, 62, 10, 'pending', NULL, NULL, '2026-09-03 08:20:52'),
(411, 63, 6, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(412, 63, 12, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(413, 63, 20, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(414, 63, 21, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(415, 63, 7, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(416, 63, 14, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(417, 63, 16, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(418, 63, 19, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(419, 63, 5, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(420, 63, 8, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(421, 63, 10, 'pending', NULL, NULL, '2026-09-03 08:33:01'),
(422, 64, 6, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(423, 64, 12, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(424, 64, 20, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(425, 64, 21, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(426, 64, 7, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(427, 64, 14, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(428, 64, 16, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(429, 64, 19, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(430, 64, 5, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(431, 64, 8, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(432, 64, 10, 'pending', NULL, NULL, '2026-09-03 08:59:25'),
(433, 65, 8, 'pending', NULL, NULL, '2026-09-04 01:00:34'),
(434, 65, 10, 'pending', NULL, NULL, '2026-09-04 01:00:34'),
(435, 66, 6, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(436, 66, 12, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(437, 66, 13, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(438, 66, 20, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(439, 66, 7, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(440, 66, 14, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(441, 66, 16, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(442, 66, 19, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(443, 66, 5, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(444, 66, 8, 'pending', NULL, NULL, '2026-09-04 01:16:59'),
(445, 66, 10, 'pending', NULL, NULL, '2026-09-04 01:16:59');

-- --------------------------------------------------------

--
-- Table structure for table `push_subscriptions`
--

DROP TABLE IF EXISTS `push_subscriptions`;
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `endpoint` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `p256dh` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `auth` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `push_subscriptions`
--

INSERT INTO `push_subscriptions` (`id`, `employee_id`, `endpoint`, `p256dh`, `auth`, `created_at`) VALUES
(12, 6, 'https://fcm.googleapis.com/fcm/send/ehZKowbJ-NE:APA91bEy2h-r2y8wPslTJzAZFg5X_N72QNyuBFWsXJeFOBfhVGTqgozLxtvyZN4K-Tgi87Wfk_uVEQgGAH69icUHJmmMFUxM7PARFqzHSjqIvWxMEnr50rh3U5nzeFybTX8BVH6ZFAdE', 'BIAqTvNsAVxSGzF4Y5z9TK8DHizatEvDAimV5lfmsKzb9A_3EFWRvdjPGjzUmcs3Ebr0oklyrA7M1yEZZMt0wus', 'fXRwb7fy4N2xFkipcQ0XYg', '2026-09-02 03:23:57'),
(2, 10, 'https://fcm.googleapis.com/fcm/send/d0oY7RlS-2k:APA91bEmka7Vs8BDr7LG4InVJUV8NMoOmXCI2-gMAXtpN9xftPqYzAVn8mE7stSGKVv_j6zNe2L2VKAMyXvuDwmC4Q-FbBTeJcCEwQ9ACRMH-wc51ji1zoovK96yKJ68_V2VoDOKDd2X', 'BJfL5VrIL_YhVWbmntfE_QrbUoyZdhunvaHCnNLlbfl_fayLf3EYHkL7aDFOFa5Znvd1jzWq2B1XR0I_B7aPUGM', 'lf6tOL_oYqSi6Se3wOv_RA', '2026-08-27 03:29:54'),
(13, 21, 'https://fcm.googleapis.com/fcm/send/d0oY7RlS-2k:APA91bEmka7Vs8BDr7LG4InVJUV8NMoOmXCI2-gMAXtpN9xftPqYzAVn8mE7stSGKVv_j6zNe2L2VKAMyXvuDwmC4Q-FbBTeJcCEwQ9ACRMH-wc51ji1zoovK96yKJ68_V2VoDOKDd2X', 'BJfL5VrIL_YhVWbmntfE_QrbUoyZdhunvaHCnNLlbfl_fayLf3EYHkL7aDFOFa5Znvd1jzWq2B1XR0I_B7aPUGM', 'lf6tOL_oYqSi6Se3wOv_RA', '2026-09-03 06:24:50'),
(4, 12, 'https://fcm.googleapis.com/fcm/send/ehZKowbJ-NE:APA91bEy2h-r2y8wPslTJzAZFg5X_N72QNyuBFWsXJeFOBfhVGTqgozLxtvyZN4K-Tgi87Wfk_uVEQgGAH69icUHJmmMFUxM7PARFqzHSjqIvWxMEnr50rh3U5nzeFybTX8BVH6ZFAdE', 'BIAqTvNsAVxSGzF4Y5z9TK8DHizatEvDAimV5lfmsKzb9A_3EFWRvdjPGjzUmcs3Ebr0oklyrA7M1yEZZMt0wus', 'fXRwb7fy4N2xFkipcQ0XYg', '2026-08-27 03:31:00'),
(5, 13, 'https://fcm.googleapis.com/fcm/send/ehZKowbJ-NE:APA91bEy2h-r2y8wPslTJzAZFg5X_N72QNyuBFWsXJeFOBfhVGTqgozLxtvyZN4K-Tgi87Wfk_uVEQgGAH69icUHJmmMFUxM7PARFqzHSjqIvWxMEnr50rh3U5nzeFybTX8BVH6ZFAdE', 'BIAqTvNsAVxSGzF4Y5z9TK8DHizatEvDAimV5lfmsKzb9A_3EFWRvdjPGjzUmcs3Ebr0oklyrA7M1yEZZMt0wus', 'fXRwb7fy4N2xFkipcQ0XYg', '2026-08-27 03:34:49'),
(6, 21, 'https://fcm.googleapis.com/fcm/send/ehZKowbJ-NE:APA91bEy2h-r2y8wPslTJzAZFg5X_N72QNyuBFWsXJeFOBfhVGTqgozLxtvyZN4K-Tgi87Wfk_uVEQgGAH69icUHJmmMFUxM7PARFqzHSjqIvWxMEnr50rh3U5nzeFybTX8BVH6ZFAdE', 'BIAqTvNsAVxSGzF4Y5z9TK8DHizatEvDAimV5lfmsKzb9A_3EFWRvdjPGjzUmcs3Ebr0oklyrA7M1yEZZMt0wus', 'fXRwb7fy4N2xFkipcQ0XYg', '2026-08-27 03:35:04'),
(7, 13, 'https://fcm.googleapis.com/fcm/send/d0oY7RlS-2k:APA91bEmka7Vs8BDr7LG4InVJUV8NMoOmXCI2-gMAXtpN9xftPqYzAVn8mE7stSGKVv_j6zNe2L2VKAMyXvuDwmC4Q-FbBTeJcCEwQ9ACRMH-wc51ji1zoovK96yKJ68_V2VoDOKDd2X', 'BJfL5VrIL_YhVWbmntfE_QrbUoyZdhunvaHCnNLlbfl_fayLf3EYHkL7aDFOFa5Znvd1jzWq2B1XR0I_B7aPUGM', 'lf6tOL_oYqSi6Se3wOv_RA', '2026-08-29 05:29:47'),
(8, 16, 'https://fcm.googleapis.com/fcm/send/ehZKowbJ-NE:APA91bEy2h-r2y8wPslTJzAZFg5X_N72QNyuBFWsXJeFOBfhVGTqgozLxtvyZN4K-Tgi87Wfk_uVEQgGAH69icUHJmmMFUxM7PARFqzHSjqIvWxMEnr50rh3U5nzeFybTX8BVH6ZFAdE', 'BIAqTvNsAVxSGzF4Y5z9TK8DHizatEvDAimV5lfmsKzb9A_3EFWRvdjPGjzUmcs3Ebr0oklyrA7M1yEZZMt0wus', 'fXRwb7fy4N2xFkipcQ0XYg', '2026-09-02 03:11:28'),
(9, 16, 'https://fcm.googleapis.com/fcm/send/ehZKowbJ-NE:APA91bEy2h-r2y8wPslTJzAZFg5X_N72QNyuBFWsXJeFOBfhVGTqgozLxtvyZN4K-Tgi87Wfk_uVEQgGAH69icUHJmmMFUxM7PARFqzHSjqIvWxMEnr50rh3U5nzeFybTX8BVH6ZFAdE', 'BIAqTvNsAVxSGzF4Y5z9TK8DHizatEvDAimV5lfmsKzb9A_3EFWRvdjPGjzUmcs3Ebr0oklyrA7M1yEZZMt0wus', 'fXRwb7fy4N2xFkipcQ0XYg', '2026-09-02 03:11:28'),
(10, 8, 'https://fcm.googleapis.com/fcm/send/ehZKowbJ-NE:APA91bEy2h-r2y8wPslTJzAZFg5X_N72QNyuBFWsXJeFOBfhVGTqgozLxtvyZN4K-Tgi87Wfk_uVEQgGAH69icUHJmmMFUxM7PARFqzHSjqIvWxMEnr50rh3U5nzeFybTX8BVH6ZFAdE', 'BIAqTvNsAVxSGzF4Y5z9TK8DHizatEvDAimV5lfmsKzb9A_3EFWRvdjPGjzUmcs3Ebr0oklyrA7M1yEZZMt0wus', 'fXRwb7fy4N2xFkipcQ0XYg', '2026-09-02 03:11:32'),
(11, 8, 'https://fcm.googleapis.com/fcm/send/ehZKowbJ-NE:APA91bEy2h-r2y8wPslTJzAZFg5X_N72QNyuBFWsXJeFOBfhVGTqgozLxtvyZN4K-Tgi87Wfk_uVEQgGAH69icUHJmmMFUxM7PARFqzHSjqIvWxMEnr50rh3U5nzeFybTX8BVH6ZFAdE', 'BIAqTvNsAVxSGzF4Y5z9TK8DHizatEvDAimV5lfmsKzb9A_3EFWRvdjPGjzUmcs3Ebr0oklyrA7M1yEZZMt0wus', 'fXRwb7fy4N2xFkipcQ0XYg', '2026-09-02 03:11:32'),
(14, 7, 'https://fcm.googleapis.com/fcm/send/d0oY7RlS-2k:APA91bEmka7Vs8BDr7LG4InVJUV8NMoOmXCI2-gMAXtpN9xftPqYzAVn8mE7stSGKVv_j6zNe2L2VKAMyXvuDwmC4Q-FbBTeJcCEwQ9ACRMH-wc51ji1zoovK96yKJ68_V2VoDOKDd2X', 'BJfL5VrIL_YhVWbmntfE_QrbUoyZdhunvaHCnNLlbfl_fayLf3EYHkL7aDFOFa5Znvd1jzWq2B1XR0I_B7aPUGM', 'lf6tOL_oYqSi6Se3wOv_RA', '2026-09-03 06:25:05');

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
  `rating_delivery` decimal(3,2) DEFAULT NULL,
  `rating_quality` decimal(3,2) DEFAULT NULL,
  `rating_pricing` decimal(3,2) DEFAULT NULL,
  `performance_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `supplier_code` (`supplier_code`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_accredited_by` (`accredited_by`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `supplier_code`, `supplier_name`, `contact_person`, `email`, `phone`, `address`, `status`, `created_at`, `updated_at`, `accredited`, `accredited_by`, `accredited_at`, `accreditation_files`, `accreditation_notes`, `rating_delivery`, `rating_quality`, `rating_pricing`, `performance_notes`) VALUES
(46, 'SUP09497652', 'fh', NULL, NULL, NULL, 'fd', 'Active', '2026-06-05 06:14:54', '2026-06-05 06:15:29', 1, 8, '2026-06-05 06:15:29', NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'SUP64822836', 'asdfa', 'Dante Obaldo Rillera', '', '', 'sdf', 'Active', '2026-06-08 07:27:28', '2026-08-27 03:31:45', 1, 8, '2026-06-08 07:53:51', '[{\"filename\":\"accreditation_files-1787797842077-186972126.jpg\",\"originalname\":\"Gemini_Generated_Image_g5mbh7g5mbh7g5mb (1).jpg\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1787797842077-186972126.jpg\",\"size\":2640436,\"mimetype\":\"image/jpeg\",\"uploaded_at\":\"2026-08-27T02:30:42.095Z\"},{\"filename\":\"accreditation_files-1787800548037-580315619.png\",\"originalname\":\"ChatGPT Image Aug 22, 2026, 02_42_52 PM.png\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1787800548037-580315619.png\",\"size\":2121105,\"mimetype\":\"image/png\",\"uploaded_at\":\"2026-08-27T03:15:48.048Z\"},{\"filename\":\"accreditation_files-1787801505551-619821284.jpg\",\"originalname\":\"Gemini_Generated_Image_g5mbh7g5mbh7g5mb (1).jpg\",\"path\":\"uploads\\\\pr-accreditation\\\\accreditation_files-1787801505551-619821284.jpg\",\"size\":2640436,\"mimetype\":\"image/jpeg\",\"uploaded_at\":\"2026-08-27T03:31:45.562Z\"}]', NULL, NULL, NULL, NULL, NULL),
(48, 'SUP46201036', 'rhrthtr', NULL, NULL, NULL, 'rethertr', 'Active', '2026-06-09 00:54:22', '2026-08-12 02:14:21', 1, 8, '2026-08-12 02:14:21', NULL, NULL, NULL, NULL, NULL, NULL),
(49, 'SUP46201279', 'sdg', NULL, NULL, NULL, 'dsfgf', 'Active', '2026-06-09 00:54:22', '2026-08-12 02:14:22', 1, 8, '2026-08-12 02:14:22', NULL, NULL, NULL, NULL, NULL, NULL),
(50, 'SUP46201431', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 00:54:22', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(51, 'SUP46388670', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 00:54:23', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'SUP46628356', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 00:54:26', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(53, 'SUP90319766', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:01:43', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(54, 'SUP9061019', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:01:46', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'SUP95983896', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:02:39', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(56, 'SUP9774432', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:02:57', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(57, 'SUP98590149', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:03:05', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(58, 'SUP99064934', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:03:10', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(59, 'SUP11313868', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:05:13', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(60, 'SUP50310056', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:11:43', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(61, 'SUP50591577', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:11:45', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(62, 'SUP51188185', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:11:51', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(63, 'SUP52213241', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:12:02', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(64, 'SUP53150066', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Inactive', '2026-06-09 01:12:11', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(65, 'SUP63034425', 'sdsdfgsdfg', NULL, NULL, NULL, 'sdfgsdg', 'Active', '2026-06-09 01:13:50', '2026-08-12 02:14:23', 1, 8, '2026-08-12 02:14:23', NULL, NULL, NULL, NULL, NULL, NULL),
(66, 'SUP16634148', 'This is just for testing', NULL, NULL, NULL, 'Mangaan, Santol, La Union', 'Active', '2026-06-19 03:52:46', '2026-06-19 03:52:57', 1, 8, '2026-06-19 03:52:57', NULL, NULL, NULL, NULL, NULL, NULL),
(67, 'SUP80713854', 'Ni Bombo Daniel ijay igi kalsada', NULL, NULL, NULL, 'San Juan, La Union', 'Active', '2026-08-12 02:30:07', '2026-08-12 02:30:09', 1, 8, '2026-08-12 02:30:09', NULL, NULL, NULL, NULL, NULL, NULL),
(68, 'SUP01041444', 'NI mang dante', NULL, NULL, NULL, 'Ijay igdi lacong', 'Active', '2026-08-12 03:23:30', '2026-08-12 03:23:32', 1, 8, '2026-08-12 03:23:32', NULL, NULL, NULL, NULL, NULL, NULL),
(69, 'SUP48368464', 'as', NULL, NULL, NULL, 'asdas', 'Active', '2026-08-14 00:31:23', '2026-08-14 00:31:25', 1, 8, '2026-08-14 00:31:25', NULL, NULL, NULL, NULL, NULL, NULL),
(70, 'SUP22567257', 'wfasdf', NULL, NULL, NULL, 'asdfawfas', 'Active', '2026-08-14 06:50:25', '2026-08-14 06:50:28', 1, 8, '2026-08-14 06:50:28', NULL, NULL, NULL, NULL, NULL, NULL),
(71, 'SUP42196780', 'TBD', NULL, NULL, NULL, NULL, 'Active', '2026-09-03 07:27:01', '2026-09-03 07:27:01', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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

-- --------------------------------------------------------

--
-- Table structure for table `system_audit_logs`
--

DROP TABLE IF EXISTS `system_audit_logs`;
CREATE TABLE IF NOT EXISTS `system_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_audit_logs`
--

INSERT INTO `system_audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`) VALUES
(1, 8, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA-2026-004\"}', '2026-08-27 01:51:39'),
(2, 8, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA-2026-004\"}', '2026-08-27 02:02:58'),
(3, 8, 'Request Deleted', 'purchase_requests', 53, '{\"pr_number\":\"2026-08-018\"}', '2026-08-27 02:20:15'),
(4, 8, 'Request Deleted', 'purchase_requests', 52, '{\"pr_number\":\"2026-08-017\"}', '2026-08-27 02:20:17'),
(5, 8, 'Request Deleted', 'purchase_requests', 46, '{\"pr_number\":\"2026-08-011\"}', '2026-08-27 02:20:19'),
(6, 8, 'Request Deleted', 'purchase_requests', 44, '{\"pr_number\":\"2026-08-009\"}', '2026-08-27 02:20:20'),
(7, 13, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0006\"}', '2026-08-27 02:30:02'),
(8, 12, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0005\"}', '2026-08-27 02:30:49'),
(9, 12, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0005\"}', '2026-08-27 02:31:27'),
(10, 13, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0006\"}', '2026-08-27 02:31:40'),
(11, 5, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0001\"}', '2026-08-27 02:32:07'),
(12, 8, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA-2026-004\"}', '2026-08-27 02:32:33'),
(13, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-08-27 02:32:41'),
(14, 13, 'Request Resubmitted', 'purchase_requests', 56, '{\"pr_number\":\"2026-08-021\"}', '2026-08-27 02:33:54'),
(15, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-08-27 03:15:05'),
(16, 5, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0001\"}', '2026-08-27 03:15:58'),
(17, 13, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0006\"}', '2026-08-27 03:16:02'),
(18, 12, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0005\"}', '2026-08-27 03:16:11'),
(19, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-08-27 03:16:41'),
(20, 13, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0006\"}', '2026-08-27 03:27:15'),
(21, 10, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA001\"}', '2026-08-27 03:29:49'),
(22, 12, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0005\"}', '2026-08-27 03:30:55'),
(23, 10, 'Request Deleted', 'purchase_requests', 37, '{\"pr_number\":\"2026-06-002\",\"project\":\"BCDA - CCTV\"}', '2026-08-27 03:34:35'),
(24, 10, 'Request Deleted', 'purchase_requests', 39, '{\"pr_number\":\"2026-06-004\",\"project\":\"BCDA - Control Tower\"}', '2026-08-27 03:34:39'),
(25, 13, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0006\"}', '2026-08-27 03:34:49'),
(26, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-08-27 03:35:04'),
(27, 13, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0006\"}', '2026-08-29 05:29:47'),
(28, 10, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA001\"}', '2026-08-29 06:22:25'),
(29, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-02 03:11:13'),
(30, 16, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ADMIN-2026-0004\"}', '2026-09-02 03:11:28'),
(31, 8, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA-2026-004\"}', '2026-09-02 03:11:32'),
(32, 12, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0005\"}', '2026-09-02 03:11:44'),
(33, 13, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0006\"}', '2026-09-02 03:23:28'),
(34, 6, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"PRO-2026-0001\"}', '2026-09-02 03:23:57'),
(35, 8, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA-2026-004\"}', '2026-09-02 03:24:39'),
(36, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-02 03:24:47'),
(37, 12, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0005\"}', '2026-09-02 03:25:03'),
(38, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-02 05:40:33'),
(39, 13, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0006\"}', '2026-09-02 05:40:59'),
(40, 12, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0005\"}', '2026-09-02 05:41:14'),
(41, 8, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA-2026-004\"}', '2026-09-02 06:00:32'),
(42, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-02 07:12:30'),
(43, 8, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA-2026-004\"}', '2026-09-02 07:20:37'),
(44, 10, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA001\"}', '2026-09-03 05:31:14'),
(45, 10, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA001\"}', '2026-09-03 05:36:11'),
(46, 10, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA001\"}', '2026-09-03 05:52:43'),
(47, 10, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA001\"}', '2026-09-03 05:57:48'),
(48, 10, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA001\"}', '2026-09-03 06:23:48'),
(49, 10, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"SA001\"}', '2026-09-03 06:23:59'),
(50, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-03 06:24:35'),
(51, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-03 06:24:49'),
(52, 7, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ADMIN-2026-0001\"}', '2026-09-03 06:25:05'),
(53, 5, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0001\"}', '2026-09-03 06:26:49'),
(54, 13, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0006\"}', '2026-09-03 06:42:01'),
(55, 5, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0001\"}', '2026-09-04 00:57:49'),
(56, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 01:16:30'),
(57, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 01:18:56'),
(58, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 01:20:00'),
(59, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 01:28:23'),
(60, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 03:00:03'),
(61, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 05:58:30'),
(62, 7, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ADMIN-2026-0001\"}', '2026-09-04 06:50:31'),
(63, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 06:50:56'),
(64, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 07:03:59'),
(65, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 07:13:46'),
(66, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 07:20:03'),
(67, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 07:43:03'),
(68, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-04 07:51:28'),
(69, 21, 'User Logged In', 'auth', NULL, '{\"employee_no\":\"ENG-2026-0009\"}', '2026-09-05 01:07:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_push_tokens`
--

DROP TABLE IF EXISTS `user_push_tokens`;
CREATE TABLE IF NOT EXISTS `user_push_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_token` (`user_id`,`token`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Constraints for table `po_admin_reviews`
--
ALTER TABLE `po_admin_reviews`
  ADD CONSTRAINT `po_reviews_po_fk` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `po_reviews_reviewer_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `purchase_requests_ibfk_1` FOREIGN KEY (`bypassed_by`) REFERENCES `employees` (`id`),
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
