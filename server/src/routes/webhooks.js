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
                        const pageId = entry.id; // Page ID form where the lead came

                        console.log(`Received leadgen_id: ${leadgenId} from page: ${pageId}`);

                        // Handle the lead retrieval asynchronously
                        handleLead(leadgenId, pageId).catch(err => console.error('Error handling lead:', err.message));
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

async function handleLead(leadgenId, pageId) {
    // 1. Find the integration config for this specific page
    // We store the 'page_id' inside the config JSON of the integration row
    // Adjust query based on how you store config. Assuming config = { page_id: "...", page_access_token: "..." }
    const integrationRes = await db.query(
        "SELECT config FROM integrations WHERE type = 'meta' AND config->>'id' = $1 LIMIT 1",
        [pageId]
    );

    if (integrationRes.rows.length === 0) {
        console.error(`No 'meta' integration found for page_id: ${pageId}. Cannot fetch lead details.`);
        return;
    }

    const config = integrationRes.rows[0].config;
    const accessToken = config.access_token; // Use 'access_token' as per auth_facebook.js structure (page access token)

    if (!accessToken) {
        console.error(`No 'access_token' found in integration config for page ${pageId}.`);
        return;
    }

    try {
        // 2. Fetch Lead Details from Facebook Graph API
        const graphUrl = `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${accessToken}`;
        const leadRes = await axios.get(graphUrl);
        const leadData = leadRes.data;

        console.log('Fetched lead data from Facebook:', JSON.stringify(leadData));

        // 3. Map fields robustly
        let name = 'Facebook Lead';
        let email = null;
        let phone = null;

        // Facebook returns field_data as an array of objects
        if (leadData.field_data) {
            leadData.field_data.forEach(field => {
                const fieldName = field.name;
                const fieldValues = field.values;

                if (fieldName === 'email') {
                    email = fieldValues[0];
                } else if (['phone_number', 'phone'].includes(fieldName)) {
                    phone = fieldValues[0];
                } else if (['full_name', 'name'].includes(fieldName)) {
                    name = fieldValues[0];
                } else if (fieldName === 'first_name') {
                    // If full_name not set, start building it
                    if (name === 'Facebook Lead') name = fieldValues[0];
                } else if (fieldName === 'last_name') {
                    // Append if realistic
                    if (name !== 'Facebook Lead' && !name.includes(fieldValues[0])) {
                        name += ` ${fieldValues[0]}`;
                    }
                }
            });
        }

        // 4. Check for duplicates using external_id (leadgenId)
        const existingLeadRes = await db.query('SELECT id FROM leads WHERE external_id = $1', [leadgenId]);

        if (existingLeadRes.rows.length > 0) {
            console.log(`Lead with external_id ${leadgenId} already exists. Skipping.`);
            return;
        }

        // Check for duplicates by email if external_id didn't match (optional, but good practice)
        if (email) {
            const emailCheck = await db.query('SELECT id FROM leads WHERE email = $1', [email]);
            if (emailCheck.rows.length > 0) {
                console.log(`Lead with email ${email} already exists. Updating source info/external_id maybe? Skipping for now.`);
                // Optionally update external_id here
                await db.query('UPDATE leads SET external_id = $1 WHERE email = $2', [leadgenId, email]);
                return;
            }
        }


        // 5. Insert into DB
        await db.query(
            'INSERT INTO leads (name, email, phone, source, status, external_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, email, phone, 'facebook', 'New', leadgenId]
        );

        console.log(`Successfully saved new lead: ${name} (ID: ${leadgenId})`);

    } catch (apiError) {
        // Log detailed error from axios
        if (apiError.response) {
            // Check for specific Graph API errors (e.g. token expired)
            console.error('Facebook Graph API Error:', apiError.response.status, JSON.stringify(apiError.response.data));
        } else {
            console.error('Error fetching/saving lead:', apiError.message);
        }
    }
}

module.exports = router;
