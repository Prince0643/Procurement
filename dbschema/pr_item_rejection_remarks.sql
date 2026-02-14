-- Table for per-item rejection remarks
-- Stores individual item remarks when a PR is rejected by Super Admin or Procurement

CREATE TABLE `pr_item_rejection_remarks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_request_id` INT NOT NULL,
  `purchase_request_item_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `remark` TEXT NOT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`purchase_request_item_id`) REFERENCES `purchase_request_items`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `employees`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
