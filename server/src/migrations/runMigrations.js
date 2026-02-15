const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigrations() {
    try {
        console.log('Running database migrations...');
        
        // Read all SQL files in the migrations directory
        const migrationsDir = __dirname;
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Execute in order
        
        for (const file of files) {
            console.log(`Executing migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await db.query(sql);
            console.log(`✓ Migration ${file} completed`);
        }
        
        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    }
}

module.exports = runMigrations;
