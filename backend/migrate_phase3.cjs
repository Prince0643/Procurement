const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'procurement_db'
  });

  try {
    const [rows] = await connection.query('SHOW TABLES');
    console.log(rows);
    
    // Also try adding fcm_token to employees
    try {
      await connection.query('ALTER TABLE employees ADD COLUMN fcm_token VARCHAR(255)');
      console.log('Added fcm_token to employees');
    } catch (e) {
      console.log('fcm_token in employees might already exist or error:', e.message);
    }
  } finally {
    await connection.end();
  }
}

run();
