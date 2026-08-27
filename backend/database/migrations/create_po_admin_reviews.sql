CREATE TABLE IF NOT EXISTS `po_admin_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `review_status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `review_comment` text COLLATE utf8mb4_unicode_ci,
  `is_current` tinyint(1) DEFAULT '1',
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `po_id` (`po_id`),
  KEY `reviewer_id` (`reviewer_id`),
  CONSTRAINT `po_reviews_po_fk` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `po_reviews_reviewer_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
