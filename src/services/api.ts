import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clubz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('clubz_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const eventService = {
  getAll: (communityId?: string | null) => 
    api.get('/events', { params: communityId ? { communityId } : {} }),
  getOne: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  getStats: (id: string) => api.get(`/events/${id}/analytics`),
  getGlobalStats: (communityId?: string | null) => 
    api.get('/events/stats/global', { params: communityId ? { communityId } : {} }),
  getGlobalHistory: (communityId?: string | null) => 
    api.get('/events/stats/history', { params: communityId ? { communityId } : {} }),
  getRecentActivity: (communityId?: string | null) => 
    api.get('/events/activity/recent', { params: communityId ? { communityId } : {} }),
  autoGenerate: (url: string) => api.post('/events/auto-generate', { url }),
  getAttendees: (id: string) => api.get(`/events/${id}/attendees`),
  checkIn: (eventId: string, ticketId: string) => api.post(`/events/${eventId}/check-in/${ticketId}`),
};

export const communityService = {
  getAll: () => api.get('/communities'),
  getMembers: (communityId?: string | null) => 
    api.get('/communities/my-members', { params: communityId ? { communityId } : {} }),
};

export default api;
