-- Insert sample pricing history data for testing
INSERT INTO pricing_history (item_id, supplier_id, unit_price, quantity, total_amount, date_recorded, notes, created_by) VALUES
-- Cement (Item ID 1)
(1, 1, 250.00, 100, 25000.00, '2025-01-15', 'Bulk purchase for Project Alpha', NULL),
(1, 1, 255.00, 50, 12750.00, '2025-02-20', 'Additional order', NULL),
(1, 2, 248.00, 100, 24800.00, '2025-03-10', 'New supplier trial', NULL),
(1, 1, 260.00, 75, 19500.00, '2025-04-05', 'Price increase due to demand', NULL),

-- Steel Bars (Item ID 2)
(2, 3, 450.00, 200, 90000.00, '2025-01-10', 'Construction materials', NULL),
(2, 3, 445.00, 150, 66750.00, '2025-02-15', 'Negotiated discount', NULL),
(2, 1, 455.00, 100, 45500.00, '2025-03-20', 'Emergency restock', NULL),

-- Sand (Item ID 3)
(3, 2, 850.00, 10, 8500.00, '2025-01-20', 'Truck load delivery', NULL),
(3, 2, 820.00, 15, 12300.00, '2025-02-25', 'Volume discount applied', NULL),
(3, 4, 875.00, 8, 7000.00, '2025-03-15', 'Alternative supplier', NULL),

-- Gravel (Item ID 4)
(4, 2, 750.00, 12, 9000.00, '2025-01-25', 'Foundation work', NULL),
(4, 2, 740.00, 20, 14800.00, '2025-03-05', 'Large project order', NULL),

-- Paint (Item ID 5)
(5, 4, 1200.00, 25, 30000.00, '2025-02-01', 'Interior painting project', NULL),
(5, 4, 1150.00, 30, 34500.00, '2025-03-25', 'Bulk discount negotiated', NULL),
(5, 1, 1250.00, 10, 12500.00, '2025-04-10', 'Premium grade paint', NULL),

-- Electrical Wire (Item ID 6)
(6, 3, 45.00, 500, 22500.00, '2025-02-10', 'Wiring for new building', NULL),
(6, 3, 42.00, 1000, 42000.00, '2025-03-30', 'Large scale project', NULL),

-- PVC Pipes (Item ID 7)
(7, 2, 180.00, 50, 9000.00, '2025-01-30', 'Plumbing installation', NULL),
(7, 4, 175.00, 75, 13125.00, '2025-03-12', 'Better pricing found', NULL),
(7, 2, 185.00, 40, 7400.00, '2025-04-08', 'Quality preferred over price', NULL),

-- Roof Tiles (Item ID 8)
(8, 1, 35.00, 1000, 35000.00, '2025-02-20', 'Complete roof replacement', NULL),
(8, 1, 33.00, 500, 16500.00, '2025-04-01', 'Loyalty discount', NULL),

-- Glass Panels (Item ID 9)
(9, 4, 2500.00, 20, 50000.00, '2025-03-01', 'Office building windows', NULL),
(9, 3, 2450.00, 15, 36750.00, '2025-04-15', 'Competitive bid', NULL),

-- Lumber (Item ID 10)
(10, 1, 650.00, 100, 65000.00, '2025-01-05', 'Framing materials', NULL),
(10, 1, 625.00, 150, 93750.00, '2025-02-28', 'Volume discount', NULL),
(10, 2, 640.00, 80, 51200.00, '2025-04-20', 'Alternative source', NULL);
