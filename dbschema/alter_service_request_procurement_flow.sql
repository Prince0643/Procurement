-- ALTER TABLE script to update service_requests status enum for new Procurement flow
-- Run this if you have an existing database with the old status values

ALTER TABLE `service_requests` 
MODIFY COLUMN `status` enum('Draft','For Procurement Review','For Super Admin Final Approval','Approved','Rejected','Cancelled','PO Created','Paid') DEFAULT 'Draft';
