-- Add supplier columns to purchase_requests table
ALTER TABLE purchase_requests 
ADD COLUMN supplier_id INT NULL,
ADD COLUMN supplier_address VARCHAR(255) NULL,
ADD FOREIGN KEY (supplier_id) REFERENCES suppliers(id);
