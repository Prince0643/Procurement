-- Add payment_request_id column to disbursement_vouchers table
ALTER TABLE disbursement_vouchers 
ADD COLUMN payment_request_id INT(11) NULL AFTER cash_request_id,
ADD INDEX idx_payment_request_id (payment_request_id),
ADD CONSTRAINT fk_dv_payment_request 
  FOREIGN KEY (payment_request_id) 
  REFERENCES payment_requests(id) 
  ON DELETE SET NULL;
