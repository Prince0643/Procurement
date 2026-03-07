-- Add payment_order_id column to disbursement_vouchers table
ALTER TABLE disbursement_vouchers 
ADD COLUMN payment_order_id INT NULL AFTER payment_request_id,
ADD CONSTRAINT fk_dv_payment_order 
  FOREIGN KEY (payment_order_id) 
  REFERENCES payment_orders(id) 
  ON DELETE SET NULL;
