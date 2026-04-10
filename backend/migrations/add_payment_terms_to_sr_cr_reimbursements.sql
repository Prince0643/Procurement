ALTER TABLE `service_requests`
  ADD COLUMN IF NOT EXISTS `payment_terms_note` TEXT NULL AFTER `order_number`;

ALTER TABLE `cash_requests`
  ADD COLUMN IF NOT EXISTS `payment_terms_note` TEXT NULL AFTER `order_number`;

ALTER TABLE `reimbursements`
  ADD COLUMN IF NOT EXISTS `payment_terms_note` TEXT NULL AFTER `order_number`;
