const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// Get settings
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM round_robin_settings WHERE id = 1');
        if (result.rows.length === 0) {
            // Initialize if missing
            const newSettings = await db.query('INSERT INTO round_robin_settings (id, is_active) VALUES (1, false) RETURNING *');
            return res.json(newSettings.rows[0]);
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update settings
router.put('/', authenticateToken, async (req, res) => {
    const { is_active, included_user_ids } = req.body;
    try {
        const result = await db.query(
            'UPDATE round_robin_settings SET is_active = $1, included_user_ids = $2, updated_at = NOW() WHERE id = 1 RETURNING *',
            [is_active, included_user_ids]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
