-- Create pricing_history table to track historical pricing for items
CREATE TABLE IF NOT EXISTS pricing_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  supplier_id INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT NULL,
  total_amount DECIMAL(12, 2) DEFAULT NULL,
  purchase_order_id INT DEFAULT NULL,
  purchase_request_id INT DEFAULT NULL,
  po_number VARCHAR(50) DEFAULT NULL,
  pr_number VARCHAR(50) DEFAULT NULL,
  date_recorded DATE NOT NULL,
  notes TEXT DEFAULT NULL,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_pricing_item 
    FOREIGN KEY (item_id) 
    REFERENCES items(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_pricing_supplier 
    FOREIGN KEY (supplier_id) 
    REFERENCES suppliers(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_pricing_po 
    FOREIGN KEY (purchase_order_id) 
    REFERENCES purchase_orders(id) 
    ON DELETE SET NULL,
  CONSTRAINT fk_pricing_pr 
    FOREIGN KEY (purchase_request_id) 
    REFERENCES purchase_requests(id) 
    ON DELETE SET NULL,
  CONSTRAINT fk_pricing_created_by 
    FOREIGN KEY (created_by) 
    REFERENCES employees(id) 
    ON DELETE SET NULL
);

-- Add indexes for common queries
CREATE INDEX idx_pricing_item_id ON pricing_history(item_id);
CREATE INDEX idx_pricing_supplier_id ON pricing_history(supplier_id);
CREATE INDEX idx_pricing_date ON pricing_history(date_recorded);
CREATE INDEX idx_pricing_po ON pricing_history(purchase_order_id);
