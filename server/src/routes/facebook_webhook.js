const express = require('express');
const router = express.Router();
const db = require('../db');

// Webhook verification endpoint (GET)
router.get('/', (req, res) => {
    const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'flow_estate_webhook_token_2024';
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook verified successfully');
            res.status(200).send(challenge);
        } else {
            console.log('Webhook verification failed');
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// Webhook endpoint to receive leads (POST)
router.post('/', async (req, res) => {
    try {
        const body = req.body;
        
        console.log('Received webhook:', JSON.stringify(body, null, 2));
        
        // Check if this is a page webhook
        if (body.object === 'page') {
            // Iterate over each entry
            for (const entry of body.entry) {
                // Get the webhook event
                for (const change of entry.changes) {
                    if (change.field === 'leadgen') {
                        const leadgenId = change.value.leadgen_id;
                        const pageId = change.value.page_id;
                        const formId = change.value.form_id;
                        const createdTime = change.value.created_time;
                        
                        console.log(`New lead received: ${leadgenId} from page ${pageId}`);
                        
                        // Find the connection for this page and form
                        const connectionQuery = `
                            SELECT * FROM facebook_connections 
                            WHERE page_id = $1 AND (form_id = $2 OR form_id IS NULL)
                            LIMIT 1
                        `;
                        const connectionResult = await db.query(connectionQuery, [pageId, formId]);
                        
                        if (connectionResult.rows.length === 0) {
                            console.log(`No connection found for page ${pageId} and form ${formId}`);
                            continue;
                        }
                        
                        const connection = connectionResult.rows[0];
                        const accessToken = connection.access_token;
                        
                        // Fetch lead data from Facebook Graph API
                        const leadDataResponse = await fetch(
                            `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${accessToken}`
                        );
                        const leadData = await leadDataResponse.json();
                        
                        console.log('Lead data from Facebook:', JSON.stringify(leadData, null, 2));
                        
                        // Parse lead fields
                        const leadFields = {};
                        if (leadData.field_data) {
                            for (const field of leadData.field_data) {
                                leadFields[field.name] = field.values.join(', ');
                            }
                        }
                        
                        // Extract common fields
                        const fullName = leadFields.full_name || leadFields.name || 'Unknown';
                        const email = leadFields.email || null;
                        const phone = leadFields.phone || leadFields.phone_number || null;
                        
                        // Insert lead into database
                        const insertLeadQuery = `
                            INSERT INTO leads (
                                name, email, phone, source, status, 
                                pipeline_stage, raw_data, facebook_lead_id,
                                facebook_page_id, facebook_form_id, created_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                            RETURNING *
                        `;
                        
                        const leadResult = await db.query(insertLeadQuery, [
                            fullName,
                            email,
                            phone,
                            'facebook',
                            'new',
                            'nuevo', // Pipeline stage
                            JSON.stringify(leadFields),
                            leadgenId,
                            pageId,
                            formId
                        ]);
                        
                        console.log('Lead saved to database:', leadResult.rows[0]);
                    }
                }
            }
            
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
