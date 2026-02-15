const db = require('../db');

async function migrate() {
    try {
        console.log('Starting migration to add external_id to leads table...');

        const query = `
            ALTER TABLE leads 
            ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) UNIQUE;
        `;

        await db.query(query);
        console.log('Successfully added external_id column to leads table.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
