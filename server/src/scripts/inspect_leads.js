const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const inspectLeads = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'leads';
        `);
        console.log(res.rows);
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
};

inspectLeads();
