-- Migration: Create service_requests table (Safe)
-- Date: February 26, 2026

-- Only create table if it doesn't exist
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_name = 'service_requests'
    AND table_schema = DATABASE()
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE `service_requests` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `sr_number` varchar(50) NOT NULL,
        `requested_by` int(11) NOT NULL,
        `purpose` text NOT NULL,
        `project` varchar(255) DEFAULT NULL,
        `project_address` text DEFAULT NULL,
        `supplier_id` int(11) DEFAULT NULL,
        `amount` decimal(15,2) NOT NULL,
        `date_needed` date DEFAULT NULL,
        `remarks` text DEFAULT NULL,
        `status` enum(\'Draft\',\'Pending\',\'For Super Admin Final Approval\',\'Approved\',\'Rejected\',\'Cancelled\') DEFAULT \'Draft\',
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`),
        UNIQUE KEY `sr_number` (`sr_number`),
        KEY `requested_by` (`requested_by`),
        KEY `supplier_id` (`supplier_id`),
        KEY `status` (`status`),
        CONSTRAINT `service_requests_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`),
        CONSTRAINT `service_requests_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci',
    'SELECT \'Table service_requests already exists\' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
