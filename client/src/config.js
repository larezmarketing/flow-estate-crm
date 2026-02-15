// Centralized API configuration
export const API_URL = import.meta.env.MODE === 'production' 
  ? 'https://flow-estate-server.onrender.com' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
