import db from './config/database.js';

async function main() {
  try {
    const conn = await db.getConnection();
    
    const alterEnumQuery = `
      ALTER TABLE \`purchase_requests\`
      MODIFY COLUMN \`status\` ENUM(
        'Draft',
        'Pending',
        'Pending Admin Processing',
        'Under Admin Review',
        'For Admin Processing',
        'For Procurement Review',
        'For Engineer Review',
        'For Admin Review',
        'For Super Admin Rep Review',
        'For Super Admin Final Approval',
        'On Hold',
        'For Purchase',
        'PO Created',
        'Payment Request Created',
        'Completed',
        'Rejected',
        'Cancelled',
        'Received'
      ) COLLATE utf8mb4_unicode_ci DEFAULT 'Draft';
    `;
    console.log("Altering purchase_requests status ENUM...");
    await conn.query(alterEnumQuery);
    console.log("Status enum updated successfully.");

    conn.release();
    process.exit(0);
  } catch (error) {
    console.error("Error altering schema:", error);
    process.exit(1);
  }
}

main();
