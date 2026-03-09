-- Add cash_request_id column to payment_requests table
ALTER TABLE payment_requests
ADD COLUMN cash_request_id INT NULL AFTER service_request_id,
ADD CONSTRAINT fk_payment_request_cash_request
  FOREIGN KEY (cash_request_id) REFERENCES cash_requests(id)
  ON DELETE SET NULL;
