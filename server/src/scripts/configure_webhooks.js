const axios = require('axios');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const configureWebhooks = async () => {
    try {
        console.log('Fetching users with instances...');
        const result = await pool.query('SELECT id, whatsapp_instance_id FROM users WHERE whatsapp_instance_id IS NOT NULL');

        for (const user of result.rows) {
            const instanceName = user.whatsapp_instance_id;
            console.log(`Configuring webhook for instance: ${instanceName} (User ID: ${user.id})`);

            try {
                // Determine the local server URL or use a placeholder if testing
                // Ideally this script runs and calls the local server which then calls Evolution
                const response = await axios.post(`http://localhost:5001/api/evolution/webhook/configure/${instanceName}`, {
                    webhookUrl: 'http://host.docker.internal:5001/api/evolution/webhook', // If Evolution is in Docker and Server is local
                    events: ["MESSAGES_UPSERT"]
                });
                console.log('Success:', response.data);
            } catch (err) {
                console.error(`Failed to configure ${instanceName}:`, JSON.stringify(err.response?.data || err.message, null, 2));
            }
        }

    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await pool.end();
    }
};

configureWebhooks();
