const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// Get all deals
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`
      SELECT d.*, l.name as lead_name 
      FROM deals d
      LEFT JOIN leads l ON d.lead_id = l.id
      ORDER BY d.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get single deal
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
      SELECT d.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone
      FROM deals d
      LEFT JOIN leads l ON d.lead_id = l.id
      WHERE d.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create deal
router.post('/', authenticateToken, async (req, res) => {
    const { lead_id, stage, value, probability, expected_close_date } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO deals (lead_id, stage, value, probability, expected_close_date, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [lead_id, stage || 'Prospecting', value, probability, expected_close_date, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update deal (e.g. move stage)
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { stage, value, probability, expected_close_date } = req.body;

    // Build dynamic query fields
    const fields = [];
    const values = [];
    let query = 'UPDATE deals SET updated_at = NOW()';
    let idx = 1;

    if (stage) { query += `, stage = $${idx++}`; values.push(stage); }
    if (value) { query += `, value = $${idx++}`; values.push(value); }
    if (probability) { query += `, probability = $${idx++}`; values.push(probability); }
    if (expected_close_date) { query += `, expected_close_date = $${idx++}`; values.push(expected_close_date); }

    query += ` WHERE id = $${idx} RETURNING *`;
    values.push(id);

    try {
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete deal
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM deals WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        res.json({ message: 'Deal deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
