-- Update status column to full PR workflow enum
ALTER TABLE `reimbursements` 
  MODIFY COLUMN `status` ENUM('Draft','Pending','For Procurement Review','For Super Admin Final Approval','On Hold','For Purchase','PO Created','Payment Request Created','Completed','Rejected','Cancelled','Received') 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci 
  NULL 
  DEFAULT 'Draft';
