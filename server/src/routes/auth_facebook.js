const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// Environment variables should be set:
// FACEBOOK_APP_ID
// FACEBOOK_APP_SECRET
// BASE_URL (e.g. http://localhost:5001)

// 1. Initiate Login
router.get('/login', (req, res) => {
    const appId = process.env.FACEBOOK_APP_ID || '1213456980328065';
    const baseUrl = process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://flow-estate-crm.vercel.app' : 'http://localhost:5001');
    const redirectUri = `${baseUrl}/api/facebook/callback`;
    const scope = 'pages_show_list,leads_retrieval,ads_management,pages_read_engagement';

    // Pass user token in state if needed to link account later, or handle purely on frontend redirect
    // For simplicity, we just redirect. The frontend can also initiate this directly.
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    res.json({ url });
});

// 2. Callback from Facebook
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    const appId = process.env.FACEBOOK_APP_ID || '1213456980328065';
    const appSecret = process.env.FACEBOOK_APP_SECRET || 'eee50fcf9c941ee30983cec24374cabd';
    const baseUrl = process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://flow-estate-crm.vercel.app' : 'http://localhost:5001');
    const redirectUri = `${baseUrl}/api/facebook/callback`;

    try {
        // Exchange code for User Access Token
        const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
            params: {
                client_id: appId,
                client_secret: appSecret,
                redirect_uri: redirectUri,
                code: code
            }
        });

        const userAccessToken = tokenRes.data.access_token;

        // Optionally: Get verification of who this user is
        const meRes = await axios.get(`https://graph.facebook.com/me?access_token=${userAccessToken}`);
        const fbUserId = meRes.data.id;
        const fbUserName = meRes.data.name;

        // 5. Redirect back to frontend
        const isProduction = process.env.NODE_ENV === 'production';
        const frontendUrl = process.env.FRONTEND_URL || (isProduction ? 'https://flow-estate-crm.vercel.app' : 'http://localhost:5173');

        res.redirect(`${frontendUrl}/integrations?fb_token=${userAccessToken}&fb_user_id=${fbUserId}`);

    } catch (err) {
        console.error('Facebook Auth Error:', err.response?.data || err.message);
        res.status(500).send('Authentication failed');
    }
});

// 3. Get Pages (Proxy)
router.get('/pages', authenticateToken, async (req, res) => {
    const { user_access_token } = req.query; // Passed from frontend for now

    if (!user_access_token) return res.status(400).send('Missing access token');

    try {
        // Fetch pages the user has access to
        const response = await axios.get(`https://graph.facebook.com/v18.0/me/accounts`, {
            params: {
                access_token: user_access_token,
                limit: 100
            }
        });

        // Return structured list
        const pages = response.data.data.map(p => ({
            id: p.id,
            name: p.name,
            access_token: p.access_token // Page Access Token needed for lead retrieval
        }));

        res.json(pages);
    } catch (err) {
        console.error('Error fetching pages:', err.response?.data || err.message);
        res.status(500).send('Failed to fetch pages');
    }
});

// 4. Get Lead Gen Forms for a Page
router.get('/forms', authenticateToken, async (req, res) => {
    const { page_access_token, page_id } = req.query;

    if (!page_access_token || !page_id) return res.status(400).send('Missing page credentials');

    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${page_id}/leadgen_forms`, {
            params: {
                access_token: page_access_token,
                limit: 100
            }
        });

        const forms = response.data.data.map(f => ({
            id: f.id,
            name: f.name,
            status: f.status
        }));

        res.json(forms);
    } catch (err) {
        console.error('Error fetching forms:', err.response?.data || err.message);
        res.status(500).send('Failed to fetch forms');
    }
});


module.exports = router;
