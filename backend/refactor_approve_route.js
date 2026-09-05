import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'routes', 'purchaseRequests.js');
let content = fs.readFileSync(filePath, 'utf8');

const approveIdx = content.indexOf('router.put(\'/:id/approve\'');
const receivedIdx = content.indexOf('router.put(\'/:id/received\'');

const oldApproveRoute = content.substring(approveIdx, receivedIdx);

const newApproveRoute = `router.put('/:id/approve', authenticate, async (req, res) => {
  let conn;
  try {
    const { status, remarks } = req.body; // status is 'approved' or 'rejected' or something
    
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [prs] = await conn.query('SELECT order_number, status, total_amount, processed_by FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    await assertOrderNumberUnlocked(prs[0].order_number, 'approval');

    const pr = prs[0];
    const currentStatus = pr.status;
    const userRole = req.user.role;

    // Validate role matches current status
    if (currentStatus === 'Under Admin Review' && userRole !== 'admin') {
      await conn.rollback();
      return res.status(403).json({ message: 'This PR is awaiting Admin review.' });
    }
    if (currentStatus === 'For Super Admin Rep Review' && userRole !== 'super_admin_rep') {
      await conn.rollback();
      return res.status(403).json({ message: 'This PR is awaiting Super Admin Rep review.' });
    }
    if (currentStatus === 'For Super Admin Final Approval' && userRole !== 'super_admin') {
      await conn.rollback();
      return res.status(403).json({ message: 'This PR is awaiting Super Admin Final approval.' });
    }

    if (userRole === 'admin' && currentStatus === 'Under Admin Review') {
      if (status === 'Rejected' || status === 'rejected') {
         // Return to processing admin
         await conn.query('UPDATE purchase_requests SET status = ?, remarks = ? WHERE id = ?', ['Pending Admin Processing', remarks || 'Returned by Admin', req.params.id]);
         // Optionally reset reviews
         await conn.query('DELETE FROM purchase_request_reviews WHERE purchase_request_id = ?', [req.params.id]);
      } else {
         // Insert or update review
         await conn.query('INSERT INTO purchase_request_reviews (purchase_request_id, reviewer_id, review_status, review_comment, reviewed_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE review_status = VALUES(review_status), review_comment = VALUES(review_comment), reviewed_at = NOW()', [req.params.id, req.user.id, 'approved', remarks]);
         
         // Check if all admins approved
         const [adminCountRes] = await conn.query("SELECT count(*) as count FROM users WHERE role = 'admin' AND is_active = 1");
         const [reviewCountRes] = await conn.query("SELECT count(*) as count FROM purchase_request_reviews WHERE purchase_request_id = ? AND review_status = 'approved'", [req.params.id]);
         
         if (reviewCountRes[0].count >= adminCountRes[0].count) {
           // All admins approved! Move to next stage based on amount
           let nextStatus = 'For Super Admin Rep Review';
           if (pr.total_amount > 10000) {
             nextStatus = 'For Super Admin Final Approval';
           }
           await conn.query('UPDATE purchase_requests SET status = ?, remarks = ? WHERE id = ?', [nextStatus, 'All admins approved', req.params.id]);
         }
      }
    } else if (userRole === 'super_admin_rep' && currentStatus === 'For Super Admin Rep Review') {
       if (status === 'Rejected' || status === 'rejected') {
         await conn.query('UPDATE purchase_requests SET status = ?, remarks = ? WHERE id = ?', ['Pending Admin Processing', remarks || 'Returned by Super Admin Rep', req.params.id]);
       } else {
         await conn.query('UPDATE purchase_requests SET status = ?, approved_by = ?, approved_at = NOW(), remarks = ? WHERE id = ?', ['Completed', req.user.id, remarks, req.params.id]);
       }
    } else if (userRole === 'super_admin' && currentStatus === 'For Super Admin Final Approval') {
       if (status === 'Rejected' || status === 'rejected') {
         await conn.query('UPDATE purchase_requests SET status = ?, remarks = ? WHERE id = ?', ['Pending Admin Processing', remarks || 'Returned by Super Admin', req.params.id]);
       } else {
         await conn.query('UPDATE purchase_requests SET status = ?, approved_by = ?, approved_at = NOW(), remarks = ? WHERE id = ?', ['Completed', req.user.id, remarks, req.params.id]);
       }
    }

    await conn.commit();
    res.json({ message: \`Purchase request \${status} successfully\` });
  } catch (error) {
    if (conn) await conn.rollback();
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update purchase request' });
  } finally {
    if (conn) conn.release();
  }
});

// Mark PR as Received (engineer only, only when status is Completed)
`;

content = content.replace(oldApproveRoute, newApproveRoute);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Approve route replaced!');
