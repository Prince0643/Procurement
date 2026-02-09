CREATE TABLE `purchase_order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_order_id` INT NOT NULL,
  `purchase_request_item_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`),
  FOREIGN KEY (`purchase_request_item_id`) REFERENCES `purchase_request_items`(`id`),
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`)
);