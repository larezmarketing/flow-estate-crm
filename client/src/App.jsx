import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadForm from './pages/LeadForm';
import Deals from './pages/Deals';
import DealForm from './pages/DealForm';
import Integrations from './pages/Integrations';
import Inbox from './pages/Inbox';
import Automations from './pages/Automations';
import EmailMarketing from './pages/EmailMarketing';
import RoundRobin from './pages/RoundRobin';


import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error("Missing VITE_GOOGLE_CLIENT_ID in environment variables");
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Leads Routes */}
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/new" element={<LeadForm />} />
          <Route path="/leads/:id" element={<LeadForm />} />

          {/* Deals Routes */}
          <Route path="/deals" element={<Deals />} />
          <Route path="/deals/new" element={<DealForm />} />

          {/* Integrations */}
          <Route path="/integrations" element={<Integrations />} />

          {/* Inbox */}
          <Route path="/inbox" element={<Inbox />} />

          {/* Automations */}
          <Route path="/automations" element={<Automations />} />

          {/* Email Marketing */}
          <Route path="/email-marketing" element={<EmailMarketing />} />

          {/* Round Robin */}
          <Route path="/round-robin" element={<RoundRobin />} />


          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
