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

    try {
        const result = await db.query(
            'INSERT INTO leads (name, email, phone, source, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, email, phone, source, status || 'New', req.user.id]
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
