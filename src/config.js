// src/config.js
// Vite uses import.meta.env for environment variables

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// For debugging
console.log('API URL:', API_URL);

export { API_URL };
