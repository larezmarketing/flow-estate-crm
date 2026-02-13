const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    family: 4 // Force IPv4 to resolve Render ENETUNREACH errors
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
