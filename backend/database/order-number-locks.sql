CREATE TABLE IF NOT EXISTS `order_number_locks` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `order_number` VARCHAR(100) NOT NULL,
    `locked_by` INT(11) NOT NULL,
    `locked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_order_number_lock` (`order_number`),
    KEY `idx_locked_by` (`locked_by`),
    CONSTRAINT `fk_order_number_locks_locked_by`
      FOREIGN KEY (`locked_by`) REFERENCES `employees` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;