const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// Get all users
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT id, full_name, email, profile_picture FROM users ORDER BY full_name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query('SELECT id, full_name, email, profile_picture, phone, role, whatsapp_instance_id FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update User Profile
router.put('/profile', authenticateToken, async (req, res) => {
    const { full_name, phone } = req.body;
    const userId = req.user.id;

    try {
        // Validate input (basic)
        if (!full_name) {
            return res.status(400).json({ message: 'Full Name is required' });
        }

        const result = await db.query(
            'UPDATE users SET full_name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, full_name, role, profile_picture, phone',
            [full_name, phone, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Update Profile Error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
