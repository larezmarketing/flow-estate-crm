const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Force IPv4 to avoid ENETUNREACH errors
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const dealsRoutes = require('./routes/deals');

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/evolution', require('./routes/evolution'));
app.use('/api/n8n', require('./routes/n8n'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/facebook', require('./routes/auth_facebook'));
app.use('/api/users', require('./routes/users'));

const db = require('./db');

app.get('/', (req, res) => {
  res.send('Flow Estate CRM API Running');
});

app.get('/health-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'Connected to DB',
      time: result.rows[0].now,
      ssl: process.env.NODE_ENV === 'production'
    });
  } catch (err) {
    console.error('Health DB Error:', err);
    res.status(500).json({
      status: 'DB Connection Failed',
      message: err.message,
      code: err.code,
      detail: err.detail
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
