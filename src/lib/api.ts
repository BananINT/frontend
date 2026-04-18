import axios from 'axios';
import keycloak from './keycloak';

// Create axios instance with relative URL to use the Nginx proxy
export const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the bearer token
api.interceptors.request.use(
    async (config) => {
        if (keycloak.token) {
            try {
                // Refresh token if it's about to expire (within 30s)
                await keycloak.updateToken(30);
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            } catch (err) {
                console.error("Failed to refresh token for API call", err);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.detail || error.message);
        return Promise.reject(error);
    }
);
