import axios from 'axios';

const API = axios.create({ baseURL: '/api/analytics' });

// Users & Items
export const getAllUsers = () => API.get('/users');
export const getAllItems = () => API.get('/items');

// Reviews CRUD
export const createReview = (data) => API.post('/reviews', data);
export const getReviewsByItem = (itemId) => API.get(`/reviews/item/${itemId}`);
export const updateReview = (reviewId, data) => API.put(`/reviews/${reviewId}`, data);
export const deleteReview = (reviewId, reviewerId) =>
  API.delete(`/reviews/${reviewId}`, { data: { reviewer: reviewerId } });
