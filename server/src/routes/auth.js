const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register
router.post('/register', async (req, res) => {
    const { email, password, fullName } = req.body;

    try {
        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = await db.query(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
            [email, hashedPassword, fullName, 'agent']
        );

        // Generate token
        const token = jwt.sign({ id: newUser.rows[0].id, role: newUser.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check user
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email, full_name: user.rows[0].full_name, role: user.rows[0].role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Google Login
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Ensure this env var is set or passed here

router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        console.log("Debug Google Auth - Token Length:", token ? token.length : 'Missing');
        // console.log("Debug Google Auth - Client ID:", process.env.GOOGLE_CLIENT_ID); // Masked for security

        if (!token) {
            return res.status(400).json({ message: "Token is missing from request body" });
        }

        // Verify Google Token
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (tokenErr) {
            console.error('Google Verify Error:', tokenErr.message);
            return res.status(401).json({ message: 'Invalid Google Token: ' + tokenErr.message });
        }

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        console.log("Debug Google Auth - Verified User:", email);

        // Check if user exists
        let userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userRes.rows.length === 0) {
            // Create user
            console.log("Debug Google Auth - Creating new user");
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(generatedPassword, salt);

            const newUser = await db.query(
                'INSERT INTO users (email, password_hash, full_name, role, profile_picture) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, profile_picture, phone',
                [email, hashedPassword, name, 'agent', picture]
            );
            userRes = { rows: [newUser.rows[0]] };
        } else {
            console.log("Debug Google Auth - User exists, checking profile picture");
            // Update profile picture if it changed
            if (picture && userRes.rows[0].profile_picture !== picture) {
                const updatedUser = await db.query(
                    'UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING id, email, full_name, role, profile_picture, phone',
                    [picture, userRes.rows[0].id]
                );
                userRes = { rows: [updatedUser.rows[0]] };
            }
        }

        // Generate JWT
        const jwtToken = jwt.sign({ id: userRes.rows[0].id, role: userRes.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token: jwtToken, user: {
                id: userRes.rows[0].id,
                email: userRes.rows[0].email,
                full_name: userRes.rows[0].full_name,
                role: userRes.rows[0].role,
                profile_picture: userRes.rows[0].profile_picture,
                phone: userRes.rows[0].phone
            }
        });

    } catch (err) {
        console.error('Google Auth Handler Error:', err.message);
        // Ensure we send a JSON response even for 500 errors so frontend can display it
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

module.exports = router;
