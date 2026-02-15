const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const runMigrations = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS integrations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    type VARCHAR(50) NOT NULL,
                    config JSONB,
                    status VARCHAR(20) DEFAULT 'inactive',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            await client.query(`
                CREATE TABLE IF NOT EXISTS messages (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    instance_id VARCHAR(255),
                    lead_id UUID REFERENCES leads(id),
                    remote_jid VARCHAR(255),
                    from_me BOOLEAN DEFAULT false,
                    content TEXT,
                    media_type VARCHAR(50) DEFAULT 'text',
                    status VARCHAR(50),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('Migrations executed successfully');

            // Add external_id to leads table
            await client.query(`
                ALTER TABLE leads 
                ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) UNIQUE;
            `);
            console.log('Verified/Added external_id to leads table');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Migration failed on startup:', err);
    }
};

// Run migrations (fire and forget, or await if you want to block)
runMigrations();

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
