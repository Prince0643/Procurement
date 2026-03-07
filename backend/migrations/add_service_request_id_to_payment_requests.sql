-- Add service_request_id column to payment_requests table to support creating payment requests from Service Requests

ALTER TABLE payment_requests 
ADD COLUMN service_request_id INT NULL AFTER purchase_request_id,
ADD CONSTRAINT fk_payment_requests_service_request_id 
FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL;

-- Make purchase_request_id nullable since we can now create from Service Request
ALTER TABLE payment_requests 
MODIFY COLUMN purchase_request_id INT NULL;

-- Add index for better query performance
CREATE INDEX idx_service_request_id ON payment_requests(service_request_id);
