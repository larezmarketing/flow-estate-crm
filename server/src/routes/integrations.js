const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// Get all integrations
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM integrations ORDER BY type ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update or Create integration
router.post('/', authenticateToken, async (req, res) => {
    const { type, config, status } = req.body;

    try {
        // Check if exists
        const existing = await db.query('SELECT * FROM integrations WHERE type = $1', [type]);

        let result;
        if (existing.rows.length > 0) {
            // Update
            result = await db.query(
                'UPDATE integrations SET config = $1, status = $2, updated_at = NOW() WHERE type = $3 RETURNING *',
                [config, status, type]
            );
        } else {
            // Create
            result = await db.query(
                'INSERT INTO integrations (type, config, status) VALUES ($1, $2, $3) RETURNING *',
                [type, config, status]
            );
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
