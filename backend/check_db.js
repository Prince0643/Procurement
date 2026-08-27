import pool from './config/database.js';

async function checkDb() {
    try {
        console.log('Checking purchase_request_items columns...');
        const [rows] = await pool.query(`SHOW COLUMNS FROM purchase_request_items`);
        console.log(rows.map(r => r.Field));
        
        console.log('Checking purchase_requests columns...');
        const [prRows] = await pool.query(`SHOW COLUMNS FROM purchase_requests`);
        console.log(prRows.map(r => r.Field));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkDb();
