CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `recipient_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('PR Created', 'PR Approved', 'PR Rejected', 'PO Created', 'Item Received', 'System') DEFAULT 'System',
  `related_id` INT COMMENT 'ID of related record (PR, PO, etc.)',
  `related_type` VARCHAR(50) COMMENT 'Type of related record',
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`recipient_id`) REFERENCES `employees`(`id`)
);