import axios from 'axios';

const API = axios.create({ baseURL: '/api/analytics' });

// Users & Items
export const getAllUsers = () => API.get('/users');
export const getAllItems = () => API.get('/items');

// Student Analytics
export const getStudentSummary = (userId) => API.get(`/summary/${userId}`);
export const getRentalHistory = (userId, params = {}) =>
  API.get(`/rentals/${userId}`, { params });
export const getTrustScore = (userId) => API.get(`/trust/${userId}`);

// Reviews CRUD
export const createReview = (data) => API.post('/reviews', data);
export const getReviewsByItem = (itemId) => API.get(`/reviews/item/${itemId}`);
export const updateReview = (reviewId, data) => API.put(`/reviews/${reviewId}`, data);
export const deleteReview = (reviewId, reviewerId) =>
  API.delete(`/reviews/${reviewId}`, { data: { reviewer: reviewerId } });
