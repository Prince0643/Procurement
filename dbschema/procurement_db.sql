-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 12, 2026 at 03:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `category_name`, `description`, `status`, `created_by`, `created_at`) VALUES
(1, 'Electronics', 'Electronic components and devices', 'Active', NULL, '2026-02-09 08:25:53'),
(2, 'Office Supplies', 'General office supplies and stationery', 'Active', NULL, '2026-02-09 08:25:53'),
(3, 'Safety Equipment', 'Personal protective equipment and safety gear', 'Active', NULL, '2026-02-09 08:25:53'),
(4, 'Tools', 'Hand tools and power tools', 'Active', NULL, '2026-02-09 08:25:53'),
(5, 'Raw Materials', 'Raw materials for production', 'Active', NULL, '2026-02-09 08:25:53'),
(6, 'test', '', 'Active', NULL, '2026-02-09 08:38:36');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `employee_no` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_initial` varchar(2) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `role` enum('engineer','procurement','admin','super_admin') DEFAULT 'engineer',
  `department` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_no`, `first_name`, `middle_initial`, `last_name`, `role`, `department`, `password`, `is_active`, `created_at`, `updated_at`) VALUES
(5, 'ENG-2026-0001', 'Michelle', 'T', 'Norial', 'engineer', 'Engineering', '$2a$10$te379KJk9Z8nAgG9hr1Ct.HuvvOC2sSt.i7YTr7IQEBfp1e2FylBK', 1, '2026-02-10 02:36:33', '2026-02-12 02:21:26'),
(6, 'PRO-2026-0001', 'Junnel', 'B', 'Tadina', 'procurement', 'Procurement', '$2a$10$gqG3xZE0xaT/aA5BvUMpJeVQ3vbYoOoiqS2QP7HBC3XZwm.4qusQu', 1, '2026-02-10 02:36:33', '2026-02-11 04:13:17'),
(7, 'ADMIN-2026-0001', 'Elain', 'M', 'Torres', 'admin', 'Administration', '$2a$10$gqG3xZE0xaT/aA5BvUMpJeVQ3vbYoOoiqS2QP7HBC3XZwm.4qusQu', 1, '2026-02-10 02:36:33', '2026-02-12 02:48:40'),
(8, 'SA-2026-004', 'Marc', 'J', 'Arzadon', 'super_admin', 'Management', '$2a$10$Uy/JQQbCOdM1GlMIBBtW1unfNIesn.J5kulNtx1XaR2NcKDAtmyWS', 1, '2026-02-10 02:36:33', '2026-02-12 00:51:44'),
(9, 'ENG-2026-0002', 'John Kennedy', 'K', 'Lucas', 'engineer', 'Engineering', '$2a$10$5WmbWmSvEq3gBe8cdW3RPefxhH6mQebKZ5/FYQ9FZd0WgLJdp6hDe', 1, '2026-02-10 04:42:55', '2026-02-11 04:13:26'),
(10, 'SA001', 'Super', 'D', 'Adminesu', 'super_admin', 'Management', '$2a$10$2VAa8J7EZDnfspG1/t4G1ez6MXGEnf3DLiPNqcJEm4ypE0p9RATNq', 1, '2026-02-12 00:55:00', '2026-02-12 02:48:05'),
(11, 'ENG-2026-0003', 'Julius John', 'F', 'Echague', 'engineer', 'Engineering', '$2a$10$SgSe2J/dqlMH.uPUVkXYQePzJfBd744bL2THGSA3x1B6Wm53oJlMC', 1, '2026-02-12 02:44:49', '2026-02-12 02:50:14'),
(12, 'ENG-2026-0005', 'Joylene', 'F', 'Balanon', 'engineer', 'Engineering', '$2a$10$fFUgVn7r1fE8YPLnwcTDZOhWhEhjxY1gg3rULIps0uoMBVsBE95W.', 1, '2026-02-12 02:45:21', '2026-02-12 02:50:16'),
(13, 'ENG-2026-0006', 'Winnielyn Kaye', 'W', 'Olarte', 'engineer', 'Procurement', '$2a$10$.GDmwlv/XvEmPJzt3oIb0.39RVYiJMsxBwcTaMbmFInk3th76KpIu', 1, '2026-02-12 02:45:41', '2026-02-12 02:54:11'),
(14, 'ADMIN-2026-0002', 'Ronalyn', 'W', 'Mallare', 'admin', 'Administration', '$2a$10$zZXZI/tYRPS37ZQVDeThpeaBi5uCv1P1e1EsBkScqRmt/1.iZPFWK', 1, '2026-02-12 02:46:45', '2026-02-12 02:50:21'),
(15, 'ADMIN-2026-0003', 'Admin', 'G', 'Charisse', 'admin', 'Administration', '$2a$10$a1JGadOlyuKzlNVK.ydC0ucBTKkg8c8u1CyNBmlLRDI.SzKKYXtOK', 1, '2026-02-12 02:47:14', '2026-02-12 02:50:24'),
(16, 'ADMIN-2026-0004', 'Marjorie', 'O', 'Garcia', 'admin', 'Administration', '$2a$10$pj5HrIzaIYIkWlCbcOy9sOBNxrQitgV2.Umuh.wldfJWEYy5t0Ta6', 1, '2026-02-12 02:47:46', '2026-02-12 02:50:28');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `unit` varchar(50) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `item_code`, `item_name`, `description`, `category_id`, `unit`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ITM001', 'Laptop Dell Latitude', 'Business laptop 15.6 inch', 1, 'pcs', NULL, 'Active', '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(2, 'ITM002', 'A4 Paper (Ream)', 'Premium quality A4 paper', 2, 'reams', NULL, 'Active', '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(3, 'ITM003', 'Safety Helmet', 'Hard hat for construction', 3, 'pcs', NULL, 'Active', '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(4, 'ITM004', 'Cordless Drill', '18V cordless drill driver', 4, 'pcs', NULL, 'Active', '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(5, 'ITM005', 'Steel Rod 10mm', 'Mild steel reinforcement rod', 5, 'meters', NULL, 'Active', '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(6, 'ITM006', 'Brother Printer', 'Printer for office', 1, 'pcs', NULL, 'Active', '2026-02-09 08:37:53', '2026-02-12 02:38:15'),
(7, 'ITM007', 'Office Chair', 'Chair for office', 6, 'pcs', NULL, 'Active', '2026-02-09 08:38:37', '2026-02-12 02:38:42');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('PR Created','PR Approved','PR Rejected','PO Created','Item Received','System') DEFAULT 'System',
  `related_id` int(11) DEFAULT NULL COMMENT 'ID of related record (PR, PO, etc.)',
  `related_type` varchar(50) DEFAULT NULL COMMENT 'Type of related record',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL,
  `po_number` varchar(50) NOT NULL,
  `purchase_request_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `prepared_by` int(11) NOT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `po_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `status` enum('Draft','Ordered','Delivered','Cancelled') DEFAULT 'Draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `place_of_delivery` varchar(255) DEFAULT NULL,
  `delivery_term` varchar(50) DEFAULT 'COD',
  `payment_term` varchar(50) DEFAULT 'CASH',
  `project` varchar(100) DEFAULT NULL,
  `order_number` varchar(10) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL,
  `purchase_order_id` int(11) NOT NULL,
  `purchase_request_item_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_requests`
--

CREATE TABLE `purchase_requests` (
  `id` int(11) NOT NULL,
  `pr_number` varchar(50) NOT NULL,
  `requested_by` int(11) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_needed` date DEFAULT NULL,
  `project` varchar(100) DEFAULT NULL,
  `project_address` varchar(255) DEFAULT NULL,
  `order_number` varchar(100) DEFAULT NULL,
  `status` enum('Draft','Pending','For Procurement Review','For Super Admin Final Approval','On Hold','For Purchase','PO Created','Completed','Rejected','Cancelled') DEFAULT 'For Procurement Review',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `supplier_id` int(11) DEFAULT NULL,
  `supplier_address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_request_items`
--

CREATE TABLE `purchase_request_items` (
  `id` int(11) NOT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `supplier_code` varchar(50) NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `supplier_code`, `supplier_name`, `contact_person`, `email`, `phone`, `address`, `status`, `created_at`, `updated_at`) VALUES
(1, 'SUP001', 'Tech Supplies Inc', 'Robert Wilson', 'robert@techsupplies.com', '09123456789', '123 Main St, Manila', 'Active', '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(2, 'SUP002', 'Office Depot PH', 'Maria Garcia', 'maria@officedepot.ph', '09234567890', '456 Business Ave, Quezon City', 'Active', '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(3, 'SUP003', 'Safety First Co', 'David Lee', 'david@safetyfirst.com', '09345678901', '789 Industrial Rd, Makati', 'Active', '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(4, 'SUP985580', 'Mairah and Co', 'Bianca Mairah', 'ladyshorty05@gmail.com', '+639460926306', 'Sevilla, San Fernando City, La Union, Philippines\nSevilla, La Union', 'Active', '2026-02-10 02:03:05', '2026-02-12 02:40:00');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_items`
--

CREATE TABLE `supplier_items` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `lead_time_days` int(11) DEFAULT NULL COMMENT 'Estimated delivery time in days',
  `is_preferred` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier_items`
--

INSERT INTO `supplier_items` (`id`, `supplier_id`, `item_id`, `price`, `lead_time_days`, `is_preferred`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 45000.00, 7, 0, '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(2, 1, 4, 8500.00, 3, 0, '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(3, 2, 2, 280.00, 1, 0, '2026-02-09 08:25:53', '2026-02-09 08:25:53'),
(4, 3, 3, 450.00, 2, 0, '2026-02-09 08:25:53', '2026-02-09 08:25:53');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name` (`category_name`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_no` (`employee_no`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `item_code` (`item_code`),
  ADD UNIQUE KEY `item_name` (`item_name`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recipient_id` (`recipient_id`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `po_number` (`po_number`),
  ADD KEY `purchase_request_id` (`purchase_request_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `prepared_by` (`prepared_by`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_id` (`purchase_order_id`),
  ADD KEY `purchase_request_item_id` (`purchase_request_item_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pr_number` (`pr_number`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `purchase_request_items`
--
ALTER TABLE `purchase_request_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_request_id` (`purchase_request_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `received_by` (`received_by`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `supplier_code` (`supplier_code`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `supplier_items`
--
ALTER TABLE `supplier_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_supplier_item` (`supplier_id`,`item_id`),
  ADD KEY `item_id` (`item_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `purchase_request_items`
--
ALTER TABLE `purchase_request_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `supplier_items`
--
ALTER TABLE `supplier_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `items_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`),
  ADD CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `purchase_orders_ibfk_3` FOREIGN KEY (`prepared_by`) REFERENCES `employees` (`id`);

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`),
  ADD CONSTRAINT `purchase_order_items_ibfk_2` FOREIGN KEY (`purchase_request_item_id`) REFERENCES `purchase_request_items` (`id`),
  ADD CONSTRAINT `purchase_order_items_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD CONSTRAINT `purchase_requests_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `purchase_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `purchase_requests_ibfk_3` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

--
-- Constraints for table `supplier_items`
--
ALTER TABLE `supplier_items`
  ADD CONSTRAINT `supplier_items_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `supplier_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
