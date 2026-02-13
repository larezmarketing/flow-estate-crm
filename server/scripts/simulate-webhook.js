const axios = require('axios');
// Simple script to test the webhook endpoint
// Run from server directory: node scripts/simulate-webhook.js

async function run() {
    console.log('Sending webhook...');

    // Payload mimicking Facebook's leadgen event
    const payload = {
        object: "page",
        entry: [
            {
                id: "1000000", // Fake Page ID
                time: Date.now(),
                changes: [
                    {
                        field: "leadgen",
                        value: {
                            leadgen_id: "999999", // Fake Leadgen ID
                            page_id: "1000000"
                        }
                    }
                ]
            }
        ]
    };

    try {
        const res = await axios.post('http://localhost:5001/api/webhooks/facebook', payload);
        console.log('Webhook Response Status:', res.status);
        console.log('Webhook Response Data:', res.data);
    } catch (err) {
        console.error('Webhook Request Failed:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
        }
    }
}

run();
