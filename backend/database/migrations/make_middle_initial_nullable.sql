-- Make middle_initial nullable in employees table
ALTER TABLE `employees` MODIFY COLUMN `middle_initial` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL;
