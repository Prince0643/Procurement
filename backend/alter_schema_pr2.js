import db from './config/database.js';

async function main() {
  try {
    const conn = await db.getConnection();
    
    console.log("Adding processed_by to purchase_requests (if not exists)...");
    try {
      await conn.query("ALTER TABLE \`purchase_requests\` ADD COLUMN \`processed_by\` int DEFAULT NULL;");
      console.log("Added processed_by");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
      else console.log("processed_by already exists");
    }

    conn.release();
    process.exit(0);
  } catch (error) {
    console.error("Error altering schema:", error);
    process.exit(1);
  }
}

main();
