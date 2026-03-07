-- Add cr_type column to cash_requests table
ALTER TABLE cash_requests ADD COLUMN cr_type VARCHAR(50) DEFAULT 'payment_request' AFTER supplier_address;

-- Update existing records to have a default value
UPDATE cash_requests SET cr_type = 'payment_request' WHERE cr_type IS NULL;
