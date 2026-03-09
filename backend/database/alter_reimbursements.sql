-- Alter existing reimbursements table to add missing columns
-- Run these one by one in phpMyAdmin SQL tab

-- Add missing columns
ALTER TABLE `reimbursements` 
  ADD COLUMN `purpose` varchar(255) DEFAULT NULL AFTER `payee`,
  ADD COLUMN `project_address` varchar(500) DEFAULT NULL AFTER `project`,
  ADD COLUMN `order_number` varchar(100) DEFAULT NULL AFTER `project_address`,
  ADD COLUMN `date_needed` date DEFAULT NULL AFTER `amount`;

-- Note: The table already has 'address', 'place_of_delivery', 'date_of_delivery', 
-- 'delivery_term', 'payment_term', 'total_amount' which aren't used by the backend.
-- You can keep them or drop them if not needed.

-- If you want to clean up unused columns (optional):
-- ALTER TABLE `reimbursements` 
--   DROP COLUMN `address`,
--   DROP COLUMN `place_of_delivery`,
--   DROP COLUMN `date_of_delivery`,
--   DROP COLUMN `delivery_term`,
--   DROP COLUMN `payment_term`,
--   DROP COLUMN `total_amount`;
