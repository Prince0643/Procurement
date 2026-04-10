ALTER TABLE `purchase_requests`
  ADD COLUMN `payment_terms_code` enum('CASH','COD','NET_7','NET_15','NET_30','CUSTOM') DEFAULT NULL AFTER `payment_basis`,
  ADD COLUMN `payment_terms_note` varchar(255) DEFAULT NULL AFTER `payment_terms_code`,
  ADD COLUMN `payment_terms_set_by` int(11) DEFAULT NULL AFTER `payment_terms_note`,
  ADD COLUMN `payment_terms_set_at` timestamp NULL DEFAULT NULL AFTER `payment_terms_set_by`;

ALTER TABLE `purchase_requests`
  ADD CONSTRAINT `purchase_requests_payment_terms_set_by_fk`
    FOREIGN KEY (`payment_terms_set_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL;
