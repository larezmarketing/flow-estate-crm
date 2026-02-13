const { Pool } = require('pg');
const dns = require('dns');
const { promisify } = require('util');
const url = require('url');
require('dotenv').config();

const resolve4 = promisify(dns.resolve4);

// Create a singleton pool instance
let pool;

const getPool = async () => {
    if (pool) return pool;

    let connectionString = process.env.DATABASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';

    // Basic SSL config
    const sslConfig = isProduction ? { rejectUnauthorized: false } : false;

    try {
        if (connectionString && isProduction) {
            // Check if it's a URL-like string
            if (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://')) {
                // Parse the URL to get the hostname
                const dbUrl = new url.URL(connectionString);
                const hostname = dbUrl.hostname;

                console.log(`[DB Setup] Attempting to resolve hostname: ${hostname}`);

                // Manually resolve to IPv4
                const addresses = await resolve4(hostname);

                if (addresses && addresses.length > 0) {
                    console.log(`[DB Setup] Resolved ${hostname} to IPv4: ${addresses[0]}`);
                    // Replace hostname with IP in the URL
                    dbUrl.hostname = addresses[0];
                    connectionString = dbUrl.toString();
                } else {
                    console.warn(`[DB Setup] No IPv4 addresses found for ${hostname}`);
                }
            }
        }
    } catch (err) {
        console.error('[DB Setup] DNS resolution failed or URL parse error, using provided connection string:', err.message);
    }

    console.log('[DB Setup] Initializing pool...');

    pool = new Pool({
        connectionString: connectionString,
        ssl: sslConfig,
    });

    // Test connection
    pool.on('error', (err, client) => {
        console.error('[DB Error] Unexpected error on idle client', err);
        process.exit(-1);
    });

    return pool;
};

// Initialize pool immediately to catch errors early, but don't await it at top level
getPool().catch(err => console.error('[DB Setup] Failed to initialize pool', err));

module.exports = {
    query: async (text, params) => {
        const p = await getPool();
        return p.query(text, params);
    },
};
