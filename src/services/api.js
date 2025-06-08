import axios from 'axios';

// Obtener la URL base del backend desde las variables de entorno
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

console.log('API URL:', API_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para incluir el token en las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    console.log('Intentando login con:', credentials);
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Respuesta de login:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error en login:', error.response || error);
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  checkToken: async () => {
    try {
      const response = await api.get('/auth/check-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Servicios de usuarios
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (user) => api.post('/users', user),
  update: (id, user) => api.put(`/users/${id}`, user),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
};

// Servicios de ubicaciones
export const locationService = {
  // Obtener todas las ubicaciones (para administradores)
  getAllLocations: () => api.get('/locations'),
  // Obtener ubicaciones de un usuario específico
  getUserLocations: (userId) => api.get(`/locations/user/${userId}`),
  // Obtener ubicaciones de usuarios activos
  getActiveUserLocations: () => api.get('/locations/active'),
  // Obtener historial de ubicaciones con tareas
  getLocationHistoryWithTasks: (userId) => api.get(`/locations/history-with-tasks/${userId}`),
};

// Servicios de tareas
export const taskService = {
  getAll: () => api.get('/tasks'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (task) => api.post('/tasks', task),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  delete: (id) => api.delete(`/tasks/${id}`),
  assign: (taskId, userId) => api.post(`/tasks/${taskId}/assign/${userId}`),
};

// Servicio para actividades
export const activityService = {
  getAdminActivities: (page = 1, limit = 100, sort = '-createdAt') => 
    api.get(`/users/activities?page=${page}&limit=${limit}&sort=${sort}`),
};

export default api;
