-- Migration: Add payment_basis to purchase_requests (Safe)
-- Date: February 26, 2026

-- Only add column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'purchase_requests' 
    AND column_name = 'payment_basis'
    AND table_schema = DATABASE()
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE `purchase_requests` ADD COLUMN `payment_basis` enum(\'debt\',\'non_debt\') DEFAULT \'debt\' COMMENT \'Determines if PR leads to Purchase Order (debt) or Payment Request (non_debt)\'',
    'SELECT \'Column payment_basis already exists\' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrate existing data
UPDATE `purchase_requests` SET `payment_basis` = 'debt' WHERE `payment_basis` IS NULL;
