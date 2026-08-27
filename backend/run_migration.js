import pool from './config/database.js';

async function run() {
  try {
    console.log("Checking columns in employees...");
    const [cols] = await pool.query('SHOW COLUMNS FROM employees LIKE "email"');
    if (cols.length === 0) {
      await pool.query('ALTER TABLE employees ADD COLUMN email VARCHAR(255) NULL');
      console.log('Added email column to employees');
    } else {
      console.log('email column already exists in employees');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employee_id INT NOT NULL,
          endpoint TEXT NOT NULL,
          p256dh VARCHAR(255) NOT NULL,
          auth VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('push_subscriptions table created or already exists');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
