-- Migration: Update disbursement_vouchers for Service Request support
-- Date: February 26, 2026

-- Add service_request_id for Service Request-based DVs
ALTER TABLE `disbursement_vouchers` 
ADD COLUMN `service_request_id` int(11) DEFAULT NULL AFTER `purchase_request_id`,
ADD COLUMN `dv_type` enum('po_based','sr_based') DEFAULT 'po_based' COMMENT 'Source of DV: PO or Service Request';

-- Make purchase_order_id nullable since DV can come from Service Request
ALTER TABLE `disbursement_vouchers` 
MODIFY `purchase_order_id` int(11) DEFAULT NULL;

-- Add indexes and foreign keys
ALTER TABLE `disbursement_vouchers`
ADD KEY `service_request_id` (`service_request_id`),
ADD KEY `dv_type` (`dv_type`),
ADD CONSTRAINT `disbursement_vouchers_ibfk_7` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE;
