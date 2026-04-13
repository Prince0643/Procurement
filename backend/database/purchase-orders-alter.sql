ALTER TABLE purchase_orders
    ADD COLUMN parent_po_id INT(11) NULL,
    ADD COLUMN installment_schedule_id INT(11) NULL,
    ADD COLUMN scheduled_payment_date DATE NULL,
    ADD COLUMN scheduled_amount DECIMAL(10,2) NULL,
    ADD KEY idx_po_parent_po_id (parent_po_id),
    ADD KEY idx_po_installment_schedule_id (installment_schedule_id),
    ADD UNIQUE KEY uq_po_installment (parent_po_id, installment_schedule_id),
    ADD CONSTRAINT fk_po_parent_po_id
      FOREIGN KEY (parent_po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_po_installment_schedule_id
      FOREIGN KEY (installment_schedule_id) REFERENCES
  purchase_request_payment_schedules(id) ON DELETE SET NULL;