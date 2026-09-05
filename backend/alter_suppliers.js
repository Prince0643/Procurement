import db from './config/database.js';

async function main() {
  try {
    console.log('Adding rating and performance_notes columns to suppliers table...');
    await db.query(`
      ALTER TABLE suppliers 
      ADD COLUMN rating_delivery DECIMAL(3,2) DEFAULT NULL,
      ADD COLUMN rating_quality DECIMAL(3,2) DEFAULT NULL,
      ADD COLUMN rating_pricing DECIMAL(3,2) DEFAULT NULL,
      ADD COLUMN performance_notes TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL;
    `);
    console.log('Success! Columns added.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Error altering table:', error);
    }
  } finally {
    process.exit(0);
  }
}

main();
