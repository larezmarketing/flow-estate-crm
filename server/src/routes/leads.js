const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// Get all leads (filtered by user/tenant in a real app, strict access for MVP)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // For MVP, seeing all leads. Ideally filter by tenant_id if multi-tenant active
        const result = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get single lead
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM leads WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create lead
router.post('/', authenticateToken, async (req, res) => {
    const { name, email, phone, source, status } = req.body;
    let assignedTo = req.user.id; // Default to creator

    try {
        // Check Round Robin Settings
        const rrSettings = await db.query('SELECT * FROM round_robin_settings WHERE id = 1');
        if (rrSettings.rows.length > 0) {
            const settings = rrSettings.rows[0];
            if (settings.is_active && settings.included_user_ids && settings.included_user_ids.length > 0) {
                const { included_user_ids, last_assigned_user_id } = settings;

                // Logic to find next user
                let nextIndex = 0;
                if (last_assigned_user_id) {
                    const lastIndex = included_user_ids.indexOf(last_assigned_user_id);
                    if (lastIndex !== -1 && lastIndex < included_user_ids.length - 1) {
                        nextIndex = lastIndex + 1;
                    }
                }

                assignedTo = included_user_ids[nextIndex];

                // Update last assigned
                await db.query('UPDATE round_robin_settings SET last_assigned_user_id = $1 WHERE id = 1', [assignedTo]);
            }
        }

        const result = await db.query(
            'INSERT INTO leads (name, email, phone, source, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, email, phone, source, status || 'New', assignedTo]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update lead
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, source, status } = req.body;

    try {
        const result = await db.query(
            'UPDATE leads SET name = $1, email = $2, phone = $3, source = $4, status = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
            [name, email, phone, source, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete lead
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json({ message: 'Lead deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
