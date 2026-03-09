-- Add the missing 'amount' column (backend expects this, not 'total_amount')
ALTER TABLE `reimbursements` 
  ADD COLUMN `amount` decimal(15,2) DEFAULT 0.00 AFTER `order_number`;

-- Also add the other missing columns if not already added
ALTER TABLE `reimbursements` 
  ADD COLUMN `purpose` varchar(255) DEFAULT NULL AFTER `payee`,
  ADD COLUMN `project_address` varchar(500) DEFAULT NULL AFTER `project`,
  ADD COLUMN `order_number` varchar(100) DEFAULT NULL AFTER `project_address`,
  ADD COLUMN `date_needed` date DEFAULT NULL AFTER `amount`;
