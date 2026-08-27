const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'procurement_db',
    port: 3306
  });

  try {
    console.log('Starting migration to remove Procurement Review...');

    // 1. Move Purchase Requests
    const [prResult] = await connection.query(
      "UPDATE purchase_requests SET status = 'For Super Admin Rep Review' WHERE status = 'For Procurement Review'"
    );
    console.log(`Updated ${prResult.affectedRows} Purchase Requests.`);

    // 2. Move Service Requests
    const [srResult] = await connection.query(
      "UPDATE service_requests SET status = 'For Super Admin Rep Review' WHERE status = 'For Procurement Review'"
    );
    console.log(`Updated ${srResult.affectedRows} Service Requests.`);

    // 3. Move Cash Requests
    const [crResult] = await connection.query(
      "UPDATE cash_requests SET status = 'For Super Admin Rep Review' WHERE status = 'For Procurement Review'"
    );
    console.log(`Updated ${crResult.affectedRows} Cash Requests.`);

    // 4. Deprecate Procurement Users
    const [empResult] = await connection.query(
      "UPDATE employees SET role = 'admin' WHERE role = 'procurement'"
    );
    console.log(`Updated ${empResult.affectedRows} employees from 'procurement' to 'admin'.`);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
