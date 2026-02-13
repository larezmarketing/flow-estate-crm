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
        // Verify Google Token
        // NOTE: We are using a hardcoded client ID here for simplicity in this turn, 
        // but ideally it should match what the client sends or be in server .env
        // The user provided ID: 36639841213-0gmj5l445qo58t973h5d97i071gont29.apps.googleusercontent.com
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '36639841213-0gmj5l445qo58t973h5d97i071gont29.apps.googleusercontent.com',
        });
        const { email, name, picture } = ticket.getPayload();

        // Check if user exists
        let user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            // Create user if not exists
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(generatedPassword, salt);

            const newUser = await db.query(
                'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
                [email, hashedPassword, name, 'agent']
            );
            user = { rows: [newUser.rows[0]] };
        }

        // Generate JWT
        const jwtToken = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token: jwtToken, user: { id: user.rows[0].id, email: user.rows[0].email, full_name: user.rows[0].full_name, role: user.rows[0].role } });

    } catch (err) {
        console.error('Google Auth Error:', err.message);
        res.status(401).json({ message: 'Invalid Google Token' });
    }
});

module.exports = router;
