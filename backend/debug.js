import db from './config/database.js';

async function run() {
  try {
    const [prs] = await db.query("SELECT id, pr_number, status FROM purchase_requests WHERE pr_number = '2026-08-007'");
    console.log("PR:", prs[0]);
    if (prs.length > 0) {
      const [reviews] = await db.query("SELECT * FROM purchase_request_reviews WHERE purchase_request_id = ?", [prs[0].id]);
      console.log("Reviews:", reviews);
      
      if (reviews.length > 0) {
          const [reviewers] = await db.query("SELECT id, first_name, last_name, role FROM employees WHERE id IN (?)", [reviews.map(r => r.reviewer_id)]);
          console.log("Reviewers:", reviewers);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
