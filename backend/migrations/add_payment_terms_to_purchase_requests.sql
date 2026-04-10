SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'purchase_requests'
    AND COLUMN_NAME = 'payment_terms_code'
);

SET @col_stmt := IF(
  @col_exists = 0,
  "ALTER TABLE `purchase_requests` ADD COLUMN `payment_terms_code` enum('CASH','COD','NET_7','NET_15','NET_30','CUSTOM') DEFAULT NULL AFTER `payment_basis`",
  'SELECT 1'
);

PREPARE payment_terms_code_stmt FROM @col_stmt;
EXECUTE payment_terms_code_stmt;
DEALLOCATE PREPARE payment_terms_code_stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'purchase_requests'
    AND COLUMN_NAME = 'payment_terms_note'
);

SET @col_stmt := IF(
  @col_exists = 0,
  "ALTER TABLE `purchase_requests` ADD COLUMN `payment_terms_note` varchar(255) DEFAULT NULL AFTER `payment_terms_code`",
  'SELECT 1'
);

PREPARE payment_terms_note_stmt FROM @col_stmt;
EXECUTE payment_terms_note_stmt;
DEALLOCATE PREPARE payment_terms_note_stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'purchase_requests'
    AND COLUMN_NAME = 'payment_terms_set_by'
);

SET @col_stmt := IF(
  @col_exists = 0,
  "ALTER TABLE `purchase_requests` ADD COLUMN `payment_terms_set_by` int(11) DEFAULT NULL AFTER `payment_terms_note`",
  'SELECT 1'
);

PREPARE payment_terms_set_by_stmt FROM @col_stmt;
EXECUTE payment_terms_set_by_stmt;
DEALLOCATE PREPARE payment_terms_set_by_stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'purchase_requests'
    AND COLUMN_NAME = 'payment_terms_set_at'
);

SET @col_stmt := IF(
  @col_exists = 0,
  "ALTER TABLE `purchase_requests` ADD COLUMN `payment_terms_set_at` timestamp NULL DEFAULT NULL AFTER `payment_terms_set_by`",
  'SELECT 1'
);

PREPARE payment_terms_set_at_stmt FROM @col_stmt;
EXECUTE payment_terms_set_at_stmt;
DEALLOCATE PREPARE payment_terms_set_at_stmt;

SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'purchase_requests'
    AND COLUMN_NAME = 'payment_terms_set_by'
    AND REFERENCED_TABLE_NAME = 'employees'
    AND REFERENCED_COLUMN_NAME = 'id'
);

SET @fk_stmt := IF(
  @fk_exists = 0,
  'ALTER TABLE `purchase_requests` ADD CONSTRAINT `purchase_requests_payment_terms_set_by_fk` FOREIGN KEY (`payment_terms_set_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL',
  'SELECT 1'
);

PREPARE payment_terms_fk_stmt FROM @fk_stmt;
EXECUTE payment_terms_fk_stmt;
DEALLOCATE PREPARE payment_terms_fk_stmt;
