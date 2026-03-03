-- Migration: Link purchase_orders to service_requests
-- Date: February 26, 2026

-- Add service_request_id to purchase_orders for service request flow
ALTER TABLE `purchase_orders` 
ADD COLUMN `service_request_id` int(11) DEFAULT NULL AFTER `purchase_request_id`;

-- Add index and foreign key
ALTER TABLE `purchase_orders`
ADD KEY `service_request_id` (`service_request_id`),
ADD CONSTRAINT `purchase_orders_ibfk_4` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`);
