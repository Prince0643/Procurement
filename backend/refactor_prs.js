import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'routes', 'purchaseRequests.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the initial POST status assignments
const postStatusOld = `      // Determine status based on requester role
      let status;
      if (isDraft) {
        status = 'Draft';
      } else if (isItemRequest) {
        status = 'For Admin Processing';
      } else if (req.user.role === 'engineer') {
        status = 'For Engineer Review';
      } else if (req.user.role === 'admin') {
        status = 'For Admin Review';
      } else {
        status = 'For Super Admin Final Approval';
      }`;
const postStatusNew = `      // Determine status based on requester role
      let status;
      if (isDraft) {
        status = 'Draft';
      } else if (isItemRequest || req.user.role === 'engineer') {
        status = 'Pending';
      } else if (req.user.role === 'admin') {
        status = 'Under Admin Review';
      } else {
        status = 'For Super Admin Final Approval';
      }`;
content = content.replace(postStatusOld, postStatusNew);

// 2. Fix PUT /process validation
const processStatusOld = `      const pr = prs[0];
      if (pr.status !== 'For Admin Processing') {
        await conn.rollback();
        return res.status(400).json({ message: 'This PR is not in For Admin Processing status.' });
      }`;
const processStatusNew = `      const pr = prs[0];
      if (pr.status !== 'Pending') {
        await conn.rollback();
        return res.status(400).json({ message: 'This PR is not in Pending status.' });
      }`;
content = content.replace(processStatusOld, processStatusNew);

// 3. Fix PUT /process UPDATE query
const processUpdateOld = `      const newStatus = 'For Super Admin Rep Review';

      await conn.query(
        \`UPDATE purchase_requests SET 
          supplier_id = ?, 
          supplier_name = ?, 
          supplier_address = ?, 
          payment_basis = ?, 
          payment_terms_note = ?, 
          payment_terms_code = ?, 
          total_amount = ?, 
          status = ?
        WHERE id = ?\`,
        [matchedSupplierId, freeTextSupplierName, supAddress, pBasis, pNote, pNote ? 'CUSTOM' : null, totalAmount, newStatus, req.params.id]
      );`;
const processUpdateNew = `      const newStatus = 'Under Admin Review';

      await conn.query(
        \`UPDATE purchase_requests SET 
          supplier_id = ?, 
          supplier_name = ?, 
          supplier_address = ?, 
          payment_basis = ?, 
          payment_terms_note = ?, 
          payment_terms_code = ?, 
          total_amount = ?, 
          status = ?,
          processed_by = ?
        WHERE id = ?\`,
        [matchedSupplierId, freeTextSupplierName, supAddress, pBasis, pNote, pNote ? 'CUSTOM' : null, totalAmount, newStatus, req.user.id, req.params.id]
      );`;
content = content.replace(processUpdateOld, processUpdateNew);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored purchaseRequests.js');
