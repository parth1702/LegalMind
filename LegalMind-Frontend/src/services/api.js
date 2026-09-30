import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor (attaches JWT tokens if present)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('legalmind_token');

    // Guard: never forward fake offline tokens — they cause "jwt malformed" on the backend.
    // Any stale demo_token_* values are cleaned up here automatically.
    if (token && token.startsWith('demo_token_')) {
      console.warn('[API] Detected stale offline demo token in storage, removing it to prevent jwt malformed errors.');
      localStorage.removeItem('legalmind_token');
      return config;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (handles standard API error responses)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
