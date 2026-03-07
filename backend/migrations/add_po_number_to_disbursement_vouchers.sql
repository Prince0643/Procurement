-- Add po_number column to disbursement_vouchers table
ALTER TABLE disbursement_vouchers 
ADD COLUMN po_number VARCHAR(50) NULL AFTER cr_number;
