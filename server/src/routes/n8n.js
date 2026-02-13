const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mock database of n8n users linked to CRM users
// In a real app, this would be in the PostgreSQL database
const n8nUsers = {};

/**
 * @route   POST /api/n8n/provision
 * @desc    Get or create n8n credentials for the current user
 * @access  Private
 */
router.post('/provision', async (req, res) => {
    try {
        const { email } = req.body;

        // Credentials for the automated owner account
        // In a real multi-tenant app, we would generate these per user
        const adminEmail = 'admin@flowestate.com';
        const adminPassword = 'password123';

        console.log('Provisioning n8n for:', email);

        // 1. Try to Login to check if user exists (and verify n8n is up)
        try {
            await axios.post('http://localhost:5678/rest/login', {
                email: adminEmail,
                password: adminPassword
            });
            console.log('n8n login successful (Account exists)');
        } catch (err) {
            // 2. If login fails (401/403 or specific error), try to CREATE owner account
            // This endpoint /rest/owner/setup is used by the frontend owner setup screen
            console.log('n8n login failed, attempting to setup owner account...');
            try {
                // Determine if we need to run setup
                await axios.post('http://localhost:5678/rest/owner/setup', {
                    email: adminEmail,
                    password: adminPassword,
                    firstName: 'Admin',
                    lastName: 'FlowEstate'
                });
                console.log('n8n Owner account created via Headless API');
            } catch (setupErr) {
                // Consistently log error but don't crash, maybe it's already set up
                console.warn('Failed to auto-create n8n owner (or already exists):', setupErr.response?.data || setupErr.message);
            }
        }

        // Return credentials to frontend for auto-login
        res.json({
            email: adminEmail,
            password: adminPassword,
            shouldInit: true
        });

    } catch (err) {
        console.error('n8n Provisioning Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
