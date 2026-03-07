-- Create cash_requests table

CREATE TABLE cash_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cr_number VARCHAR(50) NOT NULL UNIQUE,
  requested_by INT NOT NULL,
  purpose TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'pcs',
  project VARCHAR(255),
  project_address TEXT,
  date_needed DATE,
  supplier_id INT,
  supplier_name VARCHAR(255),
  supplier_address TEXT,
  status ENUM('Draft', 'Pending', 'For Admin Approval', 'For Super Admin Final Approval', 'Approved', 'Cash Request Created', 'On Hold', 'Rejected') DEFAULT 'Draft',
  remarks TEXT,
  rejection_reason TEXT,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES employees(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- Add index for better query performance
CREATE INDEX idx_cr_status ON cash_requests(status);
CREATE INDEX idx_cr_requested_by ON cash_requests(requested_by);
