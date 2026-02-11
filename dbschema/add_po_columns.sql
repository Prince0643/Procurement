-- Add new columns to purchase_orders table for PO Excel export
ALTER TABLE purchase_orders 
ADD COLUMN place_of_delivery VARCHAR(255) NULL,
ADD COLUMN delivery_term VARCHAR(50) DEFAULT 'COD',
ADD COLUMN payment_term VARCHAR(50) DEFAULT 'CASH',
ADD COLUMN project VARCHAR(100) NULL;
