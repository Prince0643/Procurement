-- Migration: Add po_type to purchase_orders (Safe - checks if column exists)
-- Date: February 26, 2026

-- Only add column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'purchase_orders' 
    AND column_name = 'po_type'
    AND table_schema = DATABASE()
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE `purchase_orders` ADD COLUMN `po_type` enum(\'purchase_order\',\'payment_order\') DEFAULT \'purchase_order\' COMMENT \'Type of PO: purchase_order (debt) or payment_order (Payment Request for non-debt/prepaid)\'',
    'SELECT \'Column po_type already exists\' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index if it doesn't exist
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.statistics 
    WHERE table_name = 'purchase_orders' 
    AND index_name = 'po_type'
    AND table_schema = DATABASE()
);

SET @sql_index = IF(@index_exists = 0,
    'ALTER TABLE `purchase_orders` ADD KEY `po_type` (`po_type`)',
    'SELECT \'Index po_type already exists\' as message'
);

PREPARE stmt FROM @sql_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrate existing data (only if column was just added or is NULL)
UPDATE `purchase_orders` SET `po_type` = 'purchase_order' WHERE `po_type` IS NULL;
