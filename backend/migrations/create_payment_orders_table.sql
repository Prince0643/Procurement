-- Create payment_orders table for Service Request-sourced payment orders

CREATE TABLE payment_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(50) NOT NULL UNIQUE,
  service_request_id INT NULL,
  payee_name VARCHAR(255) NOT NULL,
  payee_address TEXT,
  purpose TEXT,
  project VARCHAR(255),
  project_address TEXT,
  order_number VARCHAR(100),
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status ENUM('Draft', 'Pending', 'For Admin Approval', 'For Super Admin Final Approval', 'Approved', 'PO Created', 'On Hold', 'Rejected') DEFAULT 'Draft',
  remarks TEXT,
  requested_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (requested_by) REFERENCES employees(id) ON DELETE RESTRICT
);

-- Add index for better query performance
CREATE INDEX idx_po_status ON payment_orders(status);
CREATE INDEX idx_po_service_request_id ON payment_orders(service_request_id);
