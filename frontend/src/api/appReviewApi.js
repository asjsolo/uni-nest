import axios from 'axios';

const API = axios.create({ baseURL: '/api/app-reviews' });

export const getAppReviews    = ()             => API.get('/');
export const getUserAppReview = (userId)       => API.get(`/user/${userId}`);
export const submitAppReview  = (data)         => API.post('/', data);
export const updateAppReview  = (id, data)     => API.put(`/${id}`, data);
export const deleteAppReview  = (id, userId)   => API.delete(`/${id}`, { data: { userId } });
