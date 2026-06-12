import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Helper to get Supabase access token from localStorage
const getAccessToken = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('auth-token')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return data.access_token;
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong.';
    if (error.response) {
      message = error.response.data?.detail || error.response.data?.message || `Error ${error.response.status}`;
    } else if (error.request) {
      message = 'Network error. Please check your connection.';
    } else {
      message = error.message;
    }
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;