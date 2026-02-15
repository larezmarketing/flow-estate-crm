const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');

// Helper function to log errors
const logError = (step, error) => {
    console.error(`Error during step: ${step}`);
    if (error.response) {
        console.error('Data:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
    } else if (error.request) {
        console.error('Request:', error.request);
    } else {
        console.error('Error Message:', error.message);
    }
};

// 1. Redirect to Facebook for user consent
router.get('/', (req, res) => {
    // Use fallbacks for safety if .env not loaded perfectly in all contexts
    // Use process.env variables directly
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;

    if (!FACEBOOK_APP_ID || !FACEBOOK_REDIRECT_URI) {
        return res.status(500).send('Facebook App ID or Redirect URI is not configured on the server.');
    }

    const scopes = [
        'leads_retrieval',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_metadata',
        'ads_management', // Crucial for forms
        'ads_read',
        'business_management'
    ];

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=${scopes.join(',')}&response_type=code`;

    console.log('Redirecting to Facebook for authentication...');
    res.redirect(authUrl);
});

// 2. Handle the callback from Facebook
router.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        console.error('Facebook callback error:', error);
        return res.status(400).send(`Error from Facebook: ${error}`);
    }

    if (!code) {
        return res.status(400).send('Error: No authorization code provided by Facebook.');
    }

    console.log('Received authorization code from Facebook.');

    // Use process.env variables directly
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;

    try {
        // Exchange authorization code for an access token
        console.log('Exchanging code for access token...');
        const tokenResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
            params: {
                client_id: FACEBOOK_APP_ID,
                client_secret: FACEBOOK_APP_SECRET,
                redirect_uri: FACEBOOK_REDIRECT_URI,
                code,
            },
            timeout: 10000
        });

        const { access_token } = tokenResponse.data;
        console.log('Successfully received access token.');

        // IMPORTANT: Here you should save the access_token to your database, associated with the user.

        // Send the token to the frontend using postMessage and close the popup
        // Set headers to allow cross-origin communication
        res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
        res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
        
        const responseHtml = `
        <html>
            <head>
            <title>Authentication Success</title>
            </head>
            <body>
            <script>
                if (window.opener) {
                console.log('Sending token to parent window...');
                window.opener.postMessage({ type: 'facebook-token', token: '${access_token}' }, 'https://flow-estate-crm.vercel.app');
                setTimeout(() => window.close(), 1000);
                } else {
                document.body.innerHTML = 'Authentication successful. You can close this window.';
                }
            </script>
            <p>Authentication successful. Please wait...</p>
            </body>
        </html>
        `;
        res.send(responseHtml);

    } catch (e) {
        logError('Access Token Exchange', e);
        res.status(500).send(`An internal server error occurred while fetching the access token: ${e.message}`);
    }
});

// 3. Fetch user's assets (Businesses, Ad Accounts, Pages)
router.get('/assets', async (req, res) => {
    const { authorization } = req.headers;
    const accessToken = authorization ? authorization.split(' ')[1] : null;

    if (!accessToken) {
        return res.status(401).send('Error: No access token provided.');
    }

    try {
        console.log('Fetching user assets...');
        const [businessesRes, adAccountsRes, pagesRes] = await Promise.all([
            axios.get('https://graph.facebook.com/v19.0/me/businesses', { params: { access_token: accessToken } }).catch(err => ({ data: { data: [] } })), // Optional perm might fail
            axios.get('https://graph.facebook.com/v19.0/me/adaccounts', { params: { access_token: accessToken, fields: 'id,name,account_id' } }).catch(err => ({ data: { data: [] } })),
            axios.get('https://graph.facebook.com/v19.0/me/accounts', { params: { access_token: accessToken, fields: 'id,name,access_token,picture' } })
        ]);
        console.log('Successfully fetched assets.');

        res.json({
            businesses: businessesRes.data.data || [],
            adAccounts: adAccountsRes.data.data || [],
            pages: pagesRes.data.data || [],
        });

    } catch (e) {
        logError('Fetching Assets', e);
        res.status(500).send('An internal server error occurred while fetching assets.');
    }
});

// 4. Fetch lead forms for a specific page
router.get('/forms/:pageId', async (req, res) => {
    const { pageId } = req.params;
    const { authorization } = req.headers;
    const accessToken = authorization ? authorization.split(' ')[1] : null;

    if (!accessToken) {
        return res.status(401).send('Error: No access token provided.');
    }

    try {
        console.log(`Fetching forms for page ${pageId}...`);
        const formsResponse = await axios.get(`https://graph.facebook.com/v19.0/${pageId}/leadgen_forms`, {
            params: { 
                access_token: accessToken,
                fields: 'id,name,status,leads_count,created_time'
            },
        });
        console.log('Successfully fetched forms:', formsResponse.data);

        res.json(formsResponse.data.data || []);

    } catch (e) {
        logError('Fetching Forms', e);
        // Return empty array instead of error to allow continuing without forms
        res.json([]);
    }
});

// 4. Save a new connection
router.post('/connections', async (req, res) => {
    try {
        const {
            name,
            accessToken,
            businessId,
            businessName,
            adAccountId,
            adAccountName,
            pageId,
            pageName,
            pagePictureUrl,
            formId,
            formName
        } = req.body;

        // TODO: Get user_id from authentication session/token
        // For now, use a placeholder or require it in the request
        const userId = req.body.userId || null;

        const result = await db.query(
            `INSERT INTO facebook_connections (
                user_id, name, access_token, business_id, business_name,
                ad_account_id, ad_account_name, page_id, page_name, page_picture_url,
                form_id, form_name, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, name, business_id, business_name, ad_account_id, ad_account_name,
                      page_id, page_name, page_picture_url, form_id, form_name, status, created_at`,
            [
                userId, name, accessToken, businessId, businessName,
                adAccountId, adAccountName, pageId, pageName, pagePictureUrl,
                formId, formName, 'active'
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        logError('Saving Connection', err);
        res.status(500).json({ error: 'Failed to save connection' });
    }
});

// 5. Get all connections for the current user
router.get('/connections', async (req, res) => {
    try {
        // TODO: Add proper authentication and get user_id from session/token
        // For now, get all connections
        const result = await db.query(
            `SELECT id, name, business_id, business_name, ad_account_id, ad_account_name,
                    page_id, page_name, page_picture_url, form_id, form_name, status, created_at
             FROM facebook_connections
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        logError('Fetching Connections', err);
        res.status(500).json({ error: 'Failed to fetch connections' });
    }
});

// 6. Delete a connection
router.delete('/connections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM facebook_connections WHERE id = $1', [id]);
        console.log(`Deleted connection ${id}`);
        res.json({ success: true });
    } catch (err) {
        logError('Deleting Connection', err);
        res.status(500).json({ error: 'Failed to delete connection' });
    }
});

module.exports = router;
