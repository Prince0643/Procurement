SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'service_requests'
    AND COLUMN_NAME = 'payment_terms_note'
);

SET @col_stmt := IF(
  @col_exists = 0,
  "ALTER TABLE `service_requests` ADD COLUMN `payment_terms_note` TEXT NULL AFTER `order_number`",
  'SELECT 1'
);

PREPARE sr_payment_terms_note_stmt FROM @col_stmt;
EXECUTE sr_payment_terms_note_stmt;
DEALLOCATE PREPARE sr_payment_terms_note_stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cash_requests'
    AND COLUMN_NAME = 'payment_terms_note'
);

SET @col_stmt := IF(
  @col_exists = 0,
  "ALTER TABLE `cash_requests` ADD COLUMN `payment_terms_note` TEXT NULL AFTER `order_number`",
  'SELECT 1'
);

PREPARE cr_payment_terms_note_stmt FROM @col_stmt;
EXECUTE cr_payment_terms_note_stmt;
DEALLOCATE PREPARE cr_payment_terms_note_stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'reimbursements'
    AND COLUMN_NAME = 'payment_terms_note'
);

SET @col_stmt := IF(
  @col_exists = 0,
  "ALTER TABLE `reimbursements` ADD COLUMN `payment_terms_note` TEXT NULL AFTER `order_number`",
  'SELECT 1'
);

PREPARE rmb_payment_terms_note_stmt FROM @col_stmt;
EXECUTE rmb_payment_terms_note_stmt;
DEALLOCATE PREPARE rmb_payment_terms_note_stmt;
