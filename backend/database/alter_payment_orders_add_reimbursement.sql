-- Add reimbursement_id column to payment_orders table
-- First drop the column if it exists (to recreate with correct type)
ALTER TABLE payment_orders DROP COLUMN IF EXISTS reimbursement_id;

-- Add the column with matching type (INT UNSIGNED)
ALTER TABLE payment_orders
ADD COLUMN reimbursement_id INT UNSIGNED NULL AFTER cash_request_id;

-- Then add the foreign key constraint
ALTER TABLE payment_orders
ADD CONSTRAINT fk_payment_order_reimbursement
  FOREIGN KEY (reimbursement_id) REFERENCES reimbursements(id)
  ON DELETE SET NULL;
