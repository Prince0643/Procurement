ALTER TABLE `purchase_requests`
  ADD COLUMN IF NOT EXISTS `payment_terms_code` enum('CASH','COD','NET_7','NET_15','NET_30','CUSTOM') DEFAULT NULL AFTER `payment_basis`,
  ADD COLUMN IF NOT EXISTS `payment_terms_note` varchar(255) DEFAULT NULL AFTER `payment_terms_code`,
  ADD COLUMN IF NOT EXISTS `payment_terms_set_by` int(11) DEFAULT NULL AFTER `payment_terms_note`,
  ADD COLUMN IF NOT EXISTS `payment_terms_set_at` timestamp NULL DEFAULT NULL AFTER `payment_terms_set_by`;

SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'purchase_requests'
    AND CONSTRAINT_NAME = 'purchase_requests_payment_terms_set_by_fk'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @fk_stmt := IF(
  @fk_exists = 0,
  'ALTER TABLE `purchase_requests` ADD CONSTRAINT `purchase_requests_payment_terms_set_by_fk` FOREIGN KEY (`payment_terms_set_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL',
  'SELECT 1'
);

PREPARE payment_terms_fk_stmt FROM @fk_stmt;
EXECUTE payment_terms_fk_stmt;
DEALLOCATE PREPARE payment_terms_fk_stmt;
