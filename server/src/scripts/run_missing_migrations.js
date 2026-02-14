const db = require('../db');
const fs = require('fs');
const path = require('path');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Create Integrations Table
        const integrationsSql = `
            CREATE TABLE IF NOT EXISTS integrations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                type VARCHAR(50) NOT NULL, -- 'meta', 'google', 'twilio'
                config JSONB,
                status VARCHAR(20) DEFAULT 'inactive',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(integrationsSql);
        console.log('Verified/Created "integrations" table.');

        // 2. Create Messages Table (if not exists)
        // Based on logic in init_db_messages.js (which I am about to read, but standardizing here)
        const messagesSql = `
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
        `;
        await db.query(messagesSql);
        console.log('Verified/Created "messages" table.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
