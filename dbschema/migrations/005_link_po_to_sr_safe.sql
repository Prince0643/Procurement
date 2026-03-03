-- Migration: Link purchase_orders to service_requests (Safe)
-- Date: February 26, 2026

-- Add service_request_id if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'purchase_orders' 
    AND column_name = 'service_request_id'
    AND table_schema = DATABASE()
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE `purchase_orders` ADD COLUMN `service_request_id` int(11) DEFAULT NULL AFTER `purchase_request_id`',
    'SELECT \'Column service_request_id already exists\' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index if it doesn't exist
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.statistics 
    WHERE table_name = 'purchase_orders' 
    AND index_name = 'service_request_id'
    AND table_schema = DATABASE()
);

SET @sql_index = IF(@index_exists = 0,
    'ALTER TABLE `purchase_orders` ADD KEY `service_request_id` (`service_request_id`)',
    'SELECT \'Index service_request_id already exists\' as message'
);

PREPARE stmt FROM @sql_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key if it doesn't exist
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.table_constraints 
    WHERE table_name = 'purchase_orders' 
    AND constraint_name = 'purchase_orders_ibfk_4'
    AND table_schema = DATABASE()
);

SET @sql_fk = IF(@fk_exists = 0,
    'ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_ibfk_4` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`)',
    'SELECT \'Foreign key purchase_orders_ibfk_4 already exists\' as message'
);

PREPARE stmt FROM @sql_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
