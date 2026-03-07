-- ========================================================
-- ALTER SCRIPT: Payment Request Feature
-- ========================================================
-- This script adds support for Payment Requests separate from Purchase Orders
-- Payment Requests are for 'Without Account' (non_debt) PRs
-- Purchase Orders are for 'With Account' (debt) PRs
-- ========================================================

-- --------------------------------------------------------
-- Add type column to purchase_orders table to distinguish PO types
-- --------------------------------------------------------

-- First, add the type column if it doesn't exist
SET @exists := (SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = 'purchase_orders' 
                AND column_name = 'po_type' 
                AND table_schema = DATABASE());

SET @sql := IF(@exists = 0, 
    'ALTER TABLE purchase_orders ADD COLUMN po_type ENUM("purchase_order", "payment_request") DEFAULT "purchase_order"',
    'SELECT "Column po_type already exists" as message');
    
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------------------
-- Create payment_requests table for detailed tracking
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS payment_requests (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pr_number` varchar(50) NOT NULL COMMENT 'Reference to original PR number',
  `purchase_request_id` int(11) NOT NULL,
  `payee_name` varchar(255) NOT NULL COMMENT 'Person/entity to pay',
  `payee_address` varchar(255) DEFAULT NULL,
  `purpose` text NOT NULL,
  `project` varchar(100) DEFAULT NULL,
  `project_address` varchar(255) DEFAULT NULL,
  `order_number` varchar(10) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_basis` enum('debt','non_debt') NOT NULL DEFAULT 'non_debt',
  `requested_by` int(11) NOT NULL,
  `status` enum('Draft','Pending','For Approval','Approved','Rejected','Cancelled','DV Created','Paid') DEFAULT 'Draft',
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
  KEY `dv_id` (`dv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Payment Request Items (line items from original PR)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS payment_request_items (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payment_request_id` int(11) NOT NULL,
  `pr_item_id` int(11) NOT NULL COMMENT 'Reference to purchase_request_items',
  `item_id` int(11) DEFAULT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(20) NOT NULL DEFAULT 'pcs',
  `description` varchar(255) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `payment_request_id` (`payment_request_id`),
  KEY `pr_item_id` (`pr_item_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Add Foreign Keys
-- --------------------------------------------------------

-- --------------------------------------------------------
-- Add Foreign Keys (with existence checks)
-- --------------------------------------------------------

-- Drop existing constraints if they exist (to avoid duplicate key errors)
ALTER TABLE payment_requests
  DROP FOREIGN KEY IF EXISTS `payment_requests_ibfk_1`,
  DROP FOREIGN KEY IF EXISTS `payment_requests_ibfk_2`,
  DROP FOREIGN KEY IF EXISTS `payment_requests_ibfk_3`,
  DROP FOREIGN KEY IF EXISTS `payment_requests_ibfk_4`;

-- Payment Requests FKs
ALTER TABLE payment_requests
  ADD CONSTRAINT `payment_requests_ibfk_1` 
    FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_requests_ibfk_2` 
    FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `payment_requests_ibfk_3` 
    FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `payment_requests_ibfk_4` 
    FOREIGN KEY (`dv_id`) REFERENCES `disbursement_vouchers` (`id`) ON DELETE SET NULL;

-- Drop existing constraints if they exist
ALTER TABLE payment_request_items
  DROP FOREIGN KEY IF EXISTS `payment_request_items_ibfk_1`,
  DROP FOREIGN KEY IF EXISTS `payment_request_items_ibfk_2`,
  DROP FOREIGN KEY IF EXISTS `payment_request_items_ibfk_3`;

-- Payment Request Items FKs
ALTER TABLE payment_request_items
  ADD CONSTRAINT `payment_request_items_ibfk_1` 
    FOREIGN KEY (`payment_request_id`) REFERENCES `payment_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_request_items_ibfk_2` 
    FOREIGN KEY (`pr_item_id`) REFERENCES `purchase_request_items` (`id`),
  ADD CONSTRAINT `payment_request_items_ibfk_3` 
    FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

-- --------------------------------------------------------
-- Update purchase_orders to allow nullable fields for payment requests
-- --------------------------------------------------------

-- Make supplier_id nullable (payment requests don't need suppliers)
ALTER TABLE purchase_orders 
  MODIFY COLUMN supplier_id int(11) NULL;

-- Make expected_delivery_date nullable
ALTER TABLE purchase_orders 
  MODIFY COLUMN expected_delivery_date date NULL;

-- Make place_of_delivery nullable
ALTER TABLE purchase_orders 
  MODIFY COLUMN place_of_delivery varchar(255) NULL;

-- --------------------------------------------------------
-- Add indexes for performance
-- --------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_po_type ON purchase_orders(po_type);

-- --------------------------------------------------------
-- Fix: Make pr_item_id and description nullable
-- (items may not have a direct PR item reference)
-- --------------------------------------------------------

ALTER TABLE payment_request_items 
  MODIFY COLUMN pr_item_id int(11) NULL;

ALTER TABLE payment_request_items 
  MODIFY COLUMN description varchar(255) NULL;

-- --------------------------------------------------------
-- Done
-- --------------------------------------------------------

SELECT 'Payment Request feature tables created successfully' as status;
