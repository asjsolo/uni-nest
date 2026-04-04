import axios from 'axios';

const API = axios.create({ baseURL: '/api/analytics' });

// Auth
export const loginUser = (email, password) => API.post('/login', { email, password });

// Users & Items
export const getAllUsers = () => API.get('/users');
export const getAllItems = () => API.get('/items');

// Student Analytics
export const getStudentSummary = (userId) => API.get(`/summary/${userId}`);
export const getRentalHistory = (userId, params = {}) =>
  API.get(`/rentals/${userId}`, { params });
export const getTrustScore = (userId) => API.get(`/trust/${userId}`);
export const getReviewsForUser = (userId) => API.get(`/reviews/user/${userId}`);

// Reviews
export const getReviewsByItem = (itemId) => API.get(`/reviews/${itemId}`);

