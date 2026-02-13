const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

// Verification Endpoint
router.get('/facebook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify Token should be an environment variable or a fixed string
    // For this MVP, we will accept 'flow_estate_secret' or env var
    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'flow_estate_secret';

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400); // Bad Request
    }
});

// Event Notification Endpoint
router.post('/facebook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'page') {
            // Returns a '200 OK' response to all requests
            res.status(200).send('EVENT_RECEIVED');

            // Process asynchronously
            for (const entry of body.entry) {
                // Get changes
                if (entry.changes && entry.changes.length > 0) {
                    const change = entry.changes[0];

                    if (change.field === 'leadgen') {
                        const leadgenId = change.value.leadgen_id;
                        const pageId = entry.id; // Page ID

                        console.log(`Received leadgen_id: ${leadgenId} for page: ${pageId}`);

                        // Handle the lead retrieval asynchronously
                        handleLead(leadgenId).catch(err => console.error('Error handling lead:', err.message));
                    }
                }
            }
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        console.error('Webhook Error:', err.message);
        // Still return 200 to Facebook so they don't retry incessantly if it's a logic error
        if (!res.headersSent) res.sendStatus(500);
    }
});

async function handleLead(leadgenId) {
    // Fetch Access Token from DB
    // Assuming we have one global 'meta' integration for simplicity in MVP
    // In a real multi-tenant app, we would look up the integration by pageId
    const integrationRes = await db.query("SELECT config FROM integrations WHERE type = 'meta' LIMIT 1");

    if (integrationRes.rows.length === 0) {
        console.error('No "meta" integration found in database. Cannot fetch lead details.');
        return;
    }

    const config = integrationRes.rows[0].config;
    const accessToken = config.page_access_token;

    if (!accessToken) {
        console.error('No "page_access_token" found in integration config.');
        return;
    }

    try {
        // Fetch Lead Details from Facebook Graph API
        const graphUrl = `https://graph.facebook.com/v17.0/${leadgenId}?access_token=${accessToken}`;
        const leadRes = await axios.get(graphUrl);
        const leadData = leadRes.data;

        console.log('Fetched lead data from Facebook:', JSON.stringify(leadData));

        // Map fields
        // Field structure: { created_time, id, field_data: [ { name: 'email', values: ['...'] }, ... ] }
        let name = 'Facebook Lead';
        let email = null;
        let phone = null;

        if (leadData.field_data) {
            leadData.field_data.forEach(field => {
                if (['full_name', 'name', 'first_name', 'last_name'].includes(field.name)) {
                    // Simple heuristic if it's just one name field. Ideally handle first/last concatenation.
                    name = field.values[0];
                }
                if (field.name === 'email') email = field.values[0];
                if (['phone_number', 'phone'].includes(field.name)) phone = field.values[0];
            });
        }

        // Insert into DB
        // Check if lead already exists to avoid duplicates? 
        // For MVP just insert.
        await db.query(
            'INSERT INTO leads (name, email, phone, source, status) VALUES ($1, $2, $3, $4, $5)',
            [name, email, phone, 'facebook', 'New']
        );

        console.log(`Successfully saved lead: ${name}`);

    } catch (apiError) {
        // Log detailed error from axios
        if (apiError.response) {
            console.error('Facebook Graph API Error:', apiError.response.status, apiError.response.data);
        } else {
            console.error('Error fetching lead:', apiError.message);
        }
    }
}

module.exports = router;
