-- Add order_number column to cash_requests table

ALTER TABLE cash_requests
ADD COLUMN order_number VARCHAR(100) NULL AFTER date_needed;
