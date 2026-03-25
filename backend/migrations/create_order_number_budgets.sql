-- Create order_number_budgets table for planned cost management

CREATE TABLE IF NOT EXISTS order_number_budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL COLLATE utf8mb4_unicode_ci,
  project VARCHAR(200) NULL COLLATE utf8mb4_unicode_ci,
  planned_cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_order_project (order_number, project)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
