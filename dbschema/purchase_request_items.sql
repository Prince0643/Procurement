CREATE TABLE `purchase_request_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_request_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) DEFAULT 0.00,
  `total_price` DECIMAL(10,2) DEFAULT 0.00,
  `remarks` TEXT,
  `status` ENUM('Pending', 'For Purchase', 'Purchased', 'Received') DEFAULT 'Pending',
  `received_by` INT,
  `received_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`),
  FOREIGN KEY (`received_by`) REFERENCES `employees`(`id`)
);