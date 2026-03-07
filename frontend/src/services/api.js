import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds - prevents rate limiting issues

const getCacheKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

const getCachedResponse = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedResponse = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and check cache for GET requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = getCacheKey(config);
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        config.adapter = () => Promise.resolve({
          data: cached,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and cache GET responses
api.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get') {
      const cacheKey = getCacheKey(response.config);
      setCachedResponse(cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/auth/login');

      if (!isAuthRequest) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
