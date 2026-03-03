-- Migration: Add po_type to purchase_orders
-- Date: February 26, 2026

-- Add po_type column to distinguish Purchase Order vs Payment Request
ALTER TABLE `purchase_orders` 
ADD COLUMN `po_type` enum('purchase_order','payment_order') DEFAULT 'purchase_order' 
COMMENT 'Type of PO: purchase_order (debt) or payment_order (Payment Request for non-debt/prepaid)';

-- Update PO status enum to include 'Pending Approval' and 'Approved' for Payment Order flow
ALTER TABLE `purchase_orders` 
MODIFY `status` enum('Draft','Pending Approval','Approved','On Hold','Ordered','Delivered','Paid','Cancelled') DEFAULT 'Draft';

-- Create index for po_type lookups
ALTER TABLE `purchase_orders`
ADD KEY `po_type` (`po_type`);

-- Migrate existing data (all existing POs are purchase_order type)
UPDATE `purchase_orders` SET `po_type` = 'purchase_order' WHERE `po_type` IS NULL;
