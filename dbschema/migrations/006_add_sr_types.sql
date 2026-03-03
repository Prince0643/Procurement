-- Migration: Add sr_type and quantity to service_requests (Safe)
-- Date: February 26, 2026

-- Add sr_type if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'service_requests' 
    AND column_name = 'sr_type'
    AND table_schema = DATABASE()
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE `service_requests` ADD COLUMN `sr_type` enum(\'payment_request\',\'payment_order\') DEFAULT \'payment_request\' COMMENT \'Type: payment_request (amount+qty) vs payment_order (amount only)\'',
    'SELECT \'Column sr_type already exists\' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add quantity if it doesn't exist
SET @column_exists2 = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'service_requests' 
    AND column_name = 'quantity'
    AND table_schema = DATABASE()
);

SET @sql2 = IF(@column_exists2 = 0, 
    'ALTER TABLE `service_requests` ADD COLUMN `quantity` decimal(10,2) DEFAULT NULL COMMENT \'Quantity for payment_request type\'',
    'SELECT \'Column quantity already exists\' as message'
);

PREPARE stmt FROM @sql2;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add unit if it doesn't exist
SET @column_exists3 = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'service_requests' 
    AND column_name = 'unit'
    AND table_schema = DATABASE()
);

SET @sql3 = IF(@column_exists3 = 0, 
    'ALTER TABLE `service_requests` ADD COLUMN `unit` varchar(20) DEFAULT NULL COMMENT \'Unit of measurement (e.g., pcs, hours, days)\'',
    'SELECT \'Column unit already exists\' as message'
);

PREPARE stmt FROM @sql3;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
