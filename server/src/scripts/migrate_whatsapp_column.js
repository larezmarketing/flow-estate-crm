const db = require('../db');

async function migrate() {
    try {
        console.log('Running migration: Adding whatsapp_instance_id to users table...');

        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS whatsapp_instance_id VARCHAR(255);
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
