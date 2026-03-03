-- Migration: Update disbursement_vouchers for Service Request support (Safe)
-- Date: February 26, 2026

-- Add service_request_id if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'disbursement_vouchers' 
    AND column_name = 'service_request_id'
    AND table_schema = DATABASE()
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE `disbursement_vouchers` ADD COLUMN `service_request_id` int(11) DEFAULT NULL AFTER `purchase_request_id`',
    'SELECT \'Column service_request_id already exists\' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add dv_type if it doesn't exist
SET @column_exists2 = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'disbursement_vouchers' 
    AND column_name = 'dv_type'
    AND table_schema = DATABASE()
);

SET @sql2 = IF(@column_exists2 = 0, 
    'ALTER TABLE `disbursement_vouchers` ADD COLUMN `dv_type` enum(\'po_based\',\'sr_based\') DEFAULT \'po_based\' COMMENT \'Whether DV is based on Purchase Order or Service Request\' AFTER `status`',
    'SELECT \'Column dv_type already exists\' as message'
);

PREPARE stmt FROM @sql2;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add sr_number if it doesn't exist
SET @column_exists3 = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'disbursement_vouchers' 
    AND column_name = 'sr_number'
    AND table_schema = DATABASE()
);

SET @sql3 = IF(@column_exists3 = 0, 
    'ALTER TABLE `disbursement_vouchers` ADD COLUMN `sr_number` varchar(50) DEFAULT NULL AFTER `pr_number`',
    'SELECT \'Column sr_number already exists\' as message'
);

PREPARE stmt FROM @sql3;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key if it doesn't exist
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.table_constraints 
    WHERE table_name = 'disbursement_vouchers' 
    AND constraint_name = 'disbursement_vouchers_ibfk_4'
    AND table_schema = DATABASE()
);

SET @sql4 = IF(@fk_exists = 0,
    'ALTER TABLE `disbursement_vouchers` ADD CONSTRAINT `disbursement_vouchers_ibfk_4` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`)',
    'SELECT \'Foreign key already exists\' as message'
);

PREPARE stmt FROM @sql4;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
