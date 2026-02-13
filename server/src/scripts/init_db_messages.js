const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Adjust path to .env depending on where the script is run from
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createMessagesTable = async () => {
    try {
        console.log('Creating messages table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                instance_id VARCHAR(255) NOT NULL,
                lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
                remote_jid VARCHAR(255) NOT NULL,
                from_me BOOLEAN DEFAULT FALSE,
                content TEXT,
                media_url TEXT,
                media_type VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'sent'
            );
        `);

        // Add index for faster queries
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_instance_remote ON messages(instance_id, remote_jid);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);`);

        console.log('Messages table created successfully.');
    } catch (error) {
        console.error('Error creating messages table:', error);
    } finally {
        await pool.end();
    }
};

createMessagesTable();
