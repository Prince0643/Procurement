-- Add cash_request_id column to payment_orders table
ALTER TABLE payment_orders
ADD COLUMN cash_request_id INT NULL AFTER service_request_id,
ADD CONSTRAINT fk_payment_order_cash_request
  FOREIGN KEY (cash_request_id) REFERENCES cash_requests(id)
  ON DELETE SET NULL;
