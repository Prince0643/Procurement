-- Allow Service Request-based Purchase Orders to persist without PR linkage.
-- Safe for PR-based POs because PR references remain supported and unchanged.

ALTER TABLE purchase_orders
  MODIFY COLUMN purchase_request_id INT(11) NULL;

ALTER TABLE purchase_order_items
  MODIFY COLUMN purchase_request_item_id INT(11) NULL;
