const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const seed = async () => {
    try {
        console.log('Seeding database...');

        // 1. Ensure a test user exists
        const hashedPassword = await bcrypt.hash('password123', 10);
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['test@flowestate.com']);

        let userId;
        if (userResult.rows.length === 0) {
            userResult = await pool.query(
                'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
                ['test@flowestate.com', hashedPassword, 'Test User', 'admin']
            );
            userId = userResult.rows[0].id;
            console.log('Created test user: test@flowestate.com / password123');
        } else {
            userId = userResult.rows[0].id;
            console.log('Using existing test user:', userId);
        }

        // 2. Clear existing leads/deals (optional, but good for clean state if requested)
        // await pool.query('DELETE FROM deals');
        // await pool.query('DELETE FROM leads');

        // 3. Create Leads
        const leadsData = [
            { name: 'Juan Perez', email: 'juan@example.com', phone: '1234567890', source: 'Meta Ads', status: 'New' },
            { name: 'Maria Garcia', email: 'maria@example.com', phone: '0987654321', source: 'Google Ads', status: 'Contacted' },
            { name: 'Carlos Lopez', email: 'carlos@example.com', phone: '1122334455', source: 'Referral', status: 'Qualified' },
            { name: 'Ana Martinez', email: 'ana@example.com', phone: '5566778899', source: 'Manual', status: 'New' },
            { name: 'Luis Rodriguez', email: 'luis@example.com', phone: '6677889900', source: 'Meta Ads', status: 'Qualified' }
        ];

        const leads = [];
        for (const lead of leadsData) {
            const res = await pool.query(
                'INSERT INTO leads (name, email, phone, source, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [lead.name, lead.email, lead.phone, lead.source, lead.status, userId]
            );
            leads.push(res.rows[0]);
        }
        console.log(`Created ${leads.length} leads`);

        // 4. Create Deals (linked to leads)
        // Distribute them across stages
        const stages = ['Prospecting', 'Negotiation', 'Proposal', 'Closed'];

        const dealsData = [
            { leadIdx: 0, value: 150000, stage: 'Prospecting', probability: 20 },
            { leadIdx: 1, value: 250000, stage: 'Negotiation', probability: 50 },
            { leadIdx: 2, value: 180000, stage: 'Proposal', probability: 80 },
            { leadIdx: 3, value: 300000, stage: 'Prospecting', probability: 10 },
            { leadIdx: 4, value: 120000, stage: 'Closed', probability: 100 }
        ];

        for (const deal of dealsData) {
            const lead = leads[deal.leadIdx];
            // Close date + 30 days
            const closeDate = new Date();
            closeDate.setDate(closeDate.getDate() + 30);

            await pool.query(
                'INSERT INTO deals (lead_id, stage, value, probability, expected_close_date, assigned_to) VALUES ($1, $2, $3, $4, $5, $6)',
                [lead.id, deal.stage, deal.value, deal.probability, closeDate, userId]
            );
        }
        console.log(`Created ${dealsData.length} deals`);

        console.log('Seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
