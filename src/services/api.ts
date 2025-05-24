import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// API endpoints
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post('/login', { email, password });
        return response.data;
    },
    register: async (email: string, password: string) => {
        const response = await api.post('/register', { email, password });
        return response.data;
    },
};

export const productsAPI = {
    getAll: async (category?: string) => {
        const response = await api.get('/products', { params: { category } });
        return response.data;
    },
    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },
    search: async (query: string) => {
        try {
            const response = await api.post('/search', { query });
            return response.data;
        } catch (error) {
            console.error('Search API error:', error);
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data?.error || 'Search failed');
            }
            throw new Error('Failed to perform search');
        }
    },
};

export const cartAPI = {
    get: async () => {
        const response = await api.get('/cart');
        return response.data;
    },
    add: async (productId: string, quantity: number = 1) => {
        const response = await api.post('/cart', { product_id: productId, quantity });
        return response.data;
    },
    remove: async (productId: string) => {
        const response = await api.delete('/cart', { data: { product_id: productId } });
        return response.data;
    },
};

export const chatAPI = {
    sendMessage: async (message: string, userPreferences?: any) => {
        const response = await api.post('/chat', {
            message,
            userPreferences: userPreferences || {
                style: 'casual',
                size: 'M',
                favoriteColors: ['blue', 'black'],
                priceRange: 'medium',
            },
        });
        return response.data;
    },
};

export default api; 