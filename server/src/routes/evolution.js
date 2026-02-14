const express = require('express');
const router = express.Router();
const axios = require('axios'); // Ensure axios is installed or use fetch if preferred (Node 18+)
const db = require('../db'); // Import DB connection

// Middleware to check for API configuration
const checkConfig = (req, res, next) => {
    if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_TOKEN) {
        return res.status(500).json({ error: 'Evolution API not configured' });
    }
    next();
};

const getEvolutionApiUrl = (endpoint) => {
    let baseUrl = process.env.EVOLUTION_API_URL || '';
    // Remove trailing slash
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    // Remove /manager if present (common user mistake coping from browser)
    if (baseUrl.endsWith('/manager')) {
        baseUrl = baseUrl.slice(0, -8);
    }
    return `${baseUrl}${endpoint}`;
};

const getHeaders = () => ({
    'apikey': process.env.EVOLUTION_API_TOKEN,
    'Content-Type': 'application/json',
});

// Create or Retrieve instance for the current user
router.post('/instance', checkConfig, async (req, res) => {
    try {
        // req.body.instanceName is IGNORED now. We use the logged-in user's ID.
        // We assume req.user is populated by auth middleware (which we need to add/ensure)
        // or we pass userId in body for now if auth middleware isn't strict yet.

        // TEMPORARY: For MVP without full auth middleware on this specific route, 
        // we might need to rely on the client sending the user ID or email.
        // Ideally, this route should be protected.
        // Let's assume the client sends { userId } or we extract it from a token if available.
        // For this specific iteration, I will modify the client to send userId.

        const { userId, description } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // 1. Check if user already has an instance
        const db = require('../db'); // Ensure correct path
        const userResult = await db.query('SELECT whatsapp_instance_id FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        let instanceName = userResult.rows[0].whatsapp_instance_id;
        console.log(`[Instance Check] User ${userId} has instance in DB: ${instanceName}`);

        // 2. If no instance, generate one
        if (!instanceName) {
            instanceName = `user_${userId}_wa`;
            console.log(`[Instance Check] Generating NEW instance name: ${instanceName}`);
            // Save to DB
            await db.query('UPDATE users SET whatsapp_instance_id = $1 WHERE id = $2', [instanceName, userId]);
        }

        console.log(`Managing instance: ${instanceName} for user ${userId}`);

        // 3. Create Instance in Evolution API (idempotent-ish)
        console.log(`Creating/Retrieving instance: ${instanceName} at URL: ${getEvolutionApiUrl('/instance/create')}`);

        try {
            const response = await axios.post(
                getEvolutionApiUrl('/instance/create'),
                {
                    instanceName: instanceName,
                    token: "",
                    qrcode: true,
                    description: description || `Flow Estate Agent ${userId}`,
                    integration: "WHATSAPP-BAILEYS"
                },
                { headers: getHeaders() }
            );
            res.json({ ...response.data, instanceName }); // Return the name we used
        } catch (apiError) {
            // If already exists, just return success with the name
            if (apiError.response?.data?.response?.message?.includes('already exists') || apiError.response?.status === 403) {
                console.log('Instance already exists (API side), returning existing...');
                return res.json({ instance: { status: 'created', instanceName }, alreadyExists: true, instanceName });
            }
            throw apiError;
        }

    } catch (error) {
        console.error('Error creating/retrieving instance:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to process instance',
            details: error.response?.data || error.message
        });
    }
});

// Connect instance and get QR Code
router.get('/instance/:instanceName/qr', checkConfig, async (req, res) => {
    try {
        const { instanceName } = req.params;

        console.log(`Getting QR for: ${instanceName} at URL: ${getEvolutionApiUrl(`/instance/connect/${instanceName}`)}`);

        // First setup/connect to ensure we get a QR
        const response = await axios.get(
            getEvolutionApiUrl(`/instance/connect/${instanceName}`),
            { headers: getHeaders() }
        );

        console.log('QR response received');
        res.json(response.data);
    } catch (error) {
        console.error('Error getting QR code:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Failed to get QR code',
            details: error.response?.data || error.message
        });
    }
});

// Check connection status
router.get('/instance/:instanceName/status', checkConfig, async (req, res) => {
    try {
        const { instanceName } = req.params;

        const response = await axios.get(
            getEvolutionApiUrl(`/instance/connectionState/${instanceName}`),
            { headers: getHeaders() }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error checking status:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to check status',
            details: error.response?.data || error.message
        });
    }
});

// Logout instance
router.delete('/instance/:instanceName/logout', checkConfig, async (req, res) => {
    try {
        const { instanceName } = req.params;
        console.log(`Logging out instance: ${instanceName}`);

        await axios.delete(
            getEvolutionApiUrl(`/instance/logout/${instanceName}`),
            { headers: getHeaders() }
        );

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to logout',
            details: error.response?.data || error.message
        });
    }
});

// Send text message
// Configure Webhook
router.post('/webhook/configure/:instanceName', checkConfig, async (req, res) => {
    try {
        const { instanceName } = req.params;
        const { webhookUrl, events } = req.body;

        // Default to localhost if not provided (for local dev with local Evolution API)
        // Ideally this should be a public URL or tunnel if Evolution API is remote.
        let defaultUrl = process.env.SERVER_URL;
        if (!defaultUrl) {
            // Try to construct from request
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.headers['x-forwarded-host'] || req.get('host');
            defaultUrl = `${protocol}://${host}`;
        }

        const url = webhookUrl || `${defaultUrl}/api/evolution/webhook`;

        console.log(`Configuring webhook for ${instanceName} to ${url}`);

        const response = await axios.post(
            getEvolutionApiUrl(`/webhook/set/${instanceName}`),
            {
                enabled: true,
                url: url,
                webhook_by_events: false, // Correct parameter name (snake_case)
                events: events || [
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "MESSAGES_DELETE",
                    "SEND_MESSAGE",
                    "CONNECTION_UPDATE",
                    "GROUPS_UPSERT",
                    "MESSAGES_SET", // Initial history sync
                    "CHATS_SET",    // Initial chats sync
                    "CONTACTS_SET"  // Initial contacts sync
                ]
            },
            { headers: getHeaders() }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error configuring webhook:', error.message);
        if (error.response?.data) {
            console.error('Evolution API Error Details:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(error.response?.status || 500).json({
            error: 'Failed to configure webhook',
            details: error.response?.data || error.message
        });
    }
});

// Send text message
router.post('/text/send', checkConfig, async (req, res) => {
    try {
        const { instanceName, number, text } = req.body;

        if (!instanceName || !number || !text) {
            return res.status(400).json({ error: 'Missing required fields: instanceName, number, text' });
        }

        console.log(`Sending message to ${number} via ${instanceName}`);

        const response = await axios.post(
            getEvolutionApiUrl(`/message/sendText/${instanceName}`),
            {
                number: number,
                options: {
                    delay: 1200,
                    presence: "composing",
                    linkPreview: false
                },
                textMessage: {
                    text: text
                }
            },
            { headers: getHeaders() }
        );

        // Save sent message to DB
        // Find lead if possible
        const cleanNumber = number.replace(/\D/g, '');
        const leadRes = await db.query('SELECT id FROM leads WHERE phone LIKE $1', [`%${cleanNumber}%`]);
        const leadId = leadRes.rows.length > 0 ? leadRes.rows[0].id : null;

        await db.query(
            'INSERT INTO messages (instance_id, lead_id, remote_jid, from_me, content, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [instanceName, leadId, cleanNumber, true, text, 'sent']
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to send message',
            details: error.response?.data || error.message
        });
    }
});

// Webhook handler (Entry point for Evolution API webhooks)
router.post('/webhook', async (req, res) => {
    try {
        const payload = req.body;
        console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

        const { type, data, instance } = payload;

        if (type === 'messages.upsert') {
            const message = data.message;
            const remoteJid = data.key.remoteJid;
            const fromMe = data.key.fromMe;
            const pushName = data.pushName;

            // Extract content (text, image, etc.)
            let content = '';
            let mediaType = 'text';

            if (message.conversation) {
                content = message.conversation;
            } else if (message.extendedTextMessage?.text) {
                content = message.extendedTextMessage.text;
            } else if (message.imageMessage) {
                mediaType = 'image';
                content = message.imageMessage.caption || '[Image]';
                // TODO: Handle media download/url
            }

            // Clean number (remove @s.whatsapp.net)
            const number = remoteJid.replace('@s.whatsapp.net', '');

            // Find lead
            const leadRes = await db.query('SELECT id FROM leads WHERE phone LIKE $1', [`%${number}%`]);
            let leadId = null;

            if (leadRes.rows.length > 0) {
                leadId = leadRes.rows[0].id;
            } else if (!fromMe) {
                // Optional: Create lead if not exists?
                // For now, just store with null lead_id or maybe try to auto-create? 
                // Let's just log it.
            }

            // Insert into DB
            await db.query(
                'INSERT INTO messages (instance_id, lead_id, remote_jid, from_me, content, media_type, timestamp) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                [instance, leadId, number, fromMe, content, mediaType]
            );

            console.log(`Saved message from ${number}: ${content}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Error');
    }
});

// Get messages for a specific lead/phone
router.get('/messages/:instanceName/:phone', checkConfig, async (req, res) => {
    try {
        const { instanceName, phone } = req.params;
        const cleanPhone = phone.replace(/\D/g, '');

        const result = await db.query(
            'SELECT * FROM messages WHERE instance_id = $1 AND remote_jid = $2 ORDER BY timestamp ASC',
            [instanceName, cleanPhone]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;
