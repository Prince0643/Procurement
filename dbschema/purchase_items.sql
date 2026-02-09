CREATE TABLE `purchase_orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `po_number` VARCHAR(50) NOT NULL,
  `purchase_request_id` INT NOT NULL,
  `supplier_id` INT NOT NULL,
  `prepared_by` INT NOT NULL, -- Admin
  `total_amount` DECIMAL(10,2) DEFAULT 0.00,
  `po_date` DATE NOT NULL,
  `expected_delivery_date` DATE,
  `actual_delivery_date` DATE,
  `status` ENUM('Draft', 'Ordered', 'Delivered', 'Cancelled') DEFAULT 'Draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_number` (`po_number`),
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`),
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`),
  FOREIGN KEY (`prepared_by`) REFERENCES `employees`(`id`)
);