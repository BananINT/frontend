import axios from 'axios';

// Create axios instance with relative URL to use the Nginx proxy
export const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.detail || error.message);
        return Promise.reject(error);
    }
);
