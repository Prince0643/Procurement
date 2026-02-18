-- Create table for PO file attachments
CREATE TABLE `po_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL COMMENT 'Relative path to file storage',
  `file_name` varchar(255) NOT NULL COMMENT 'Original file name',
  `file_size` int(11) DEFAULT NULL COMMENT 'File size in bytes',
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `po_attachments_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `po_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
