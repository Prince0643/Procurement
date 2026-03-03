-- Migration: Add payment_basis to purchase_requests
-- Date: February 26, 2026

-- Add payment_basis column to track debt vs non-debt PRs
ALTER TABLE `purchase_requests` 
ADD COLUMN `payment_basis` enum('debt','non_debt') DEFAULT 'debt' 
COMMENT 'Determines if PR leads to Purchase Order (debt) or Payment Order (non_debt)';

-- Create index for payment_basis lookups
ALTER TABLE `purchase_requests`
ADD KEY `payment_basis` (`payment_basis`);

-- Migrate existing data (all existing PRs are debt-based by default)
UPDATE `purchase_requests` SET `payment_basis` = 'debt' WHERE `payment_basis` IS NULL;
