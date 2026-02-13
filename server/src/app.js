const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

app.get('/', (req, res) => {
  res.send('Flow Estate CRM API Running');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
