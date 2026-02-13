const db = require('../src/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // Add profile_picture column
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_picture TEXT;
        `);
        console.log('Added profile_picture column');

        // Add phone column
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
        `);
        console.log('Added phone column');

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
