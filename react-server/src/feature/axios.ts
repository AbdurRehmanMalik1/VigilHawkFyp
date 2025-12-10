// src/api/axiosInstance.ts
import axios from 'axios';

// Create an axios instance with base URL pointing to your FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8050',  // or use your container hostname if needed
  timeout: 10000,                    // optional: timeout in ms
  withCredentials: true,
});

// Request interceptor (e.g., attach auth token)
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken'); // or however you store it'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor (handle global errors)
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Network error, server down, etc
      // Just log it or notify silently
      console.error('Network error, please try again later.');
      // Or trigger some global toast notification here instead of alert
    } else if (error.response.status === 401) {
      // Unauthorized - maybe token expired
      // Optionally silently redirect to login or trigger logout
      console.warn('Session expired. Redirecting to login.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const detectionApi = axios.create({
  baseURL: 'http://localhost:8051',  // or use your container hostname if needed
  timeout: 10000,                    // optional: timeout in ms
  withCredentials: true,
});


export default api;
