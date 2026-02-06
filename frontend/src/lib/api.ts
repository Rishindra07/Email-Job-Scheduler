import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
});

console.log('🚀 API BaseURL:', api.defaults.baseURL);
console.log('📅 Build Time:', new Date().toISOString());

// Add interceptor for auth token if needed
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});
