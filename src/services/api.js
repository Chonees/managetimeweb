import axios from 'axios';

// Forzar la URL local para el desarrollo
// const API_URL = process.env.REACT_APP_API_URL 
//   ? `${process.env.REACT_APP_API_URL}/api`
//   : 'https://managetime-backend-48f256c2dfe5.herokuapp.com/api';

// Forzar conexión a localhost para desarrollo
const API_URL = 'http://localhost:5000/api';

console.log('API URL configurada:', API_URL);

// Crear instancia de axios con timeout más amplio para manejar el arranque lento de Heroku
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos para dar tiempo a que arranque Heroku
  headers: {
    'Content-Type': 'application/json',
  }
});

// Añadimos un log para cada solicitud
api.interceptors.request.use(request => {
  console.log('Enviando solicitud a:', request.url);
  // Añadir timestamp para medir cuánto tarda
  request.metadata = { startTime: new Date().getTime() };
  return request;
});

// Añadimos un log para cada respuesta
api.interceptors.response.use(
  response => {
    // Calcular tiempo de respuesta
    const endTime = new Date().getTime();
    const duration = response.config.metadata ? endTime - response.config.metadata.startTime : 'desconocido';
    console.log(`Respuesta recibida de: ${response.config.url}, Status: ${response.status}, Tiempo: ${duration}ms`);
    return response;
  },
  error => {
    // Mostrar info detallada sobre el error
    const endTime = new Date().getTime();
    const duration = error.config?.metadata ? endTime - error.config.metadata.startTime : 'desconocido';
    
    if (error.response) {
      // El servidor respondió con un código de error
      console.error(`Error ${error.response.status} en solicitud a: ${error.config?.url}`);
      console.error('Datos de respuesta:', error.response.data);
      console.error('Cabeceras:', error.response.headers);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error(`No hay respuesta del servidor después de ${duration}ms:`, error.config?.url);
      console.error('¿El servidor Heroku está en modo sleep? Puede tardar hasta 30 segundos en despertar.');
    } else {
      // Error al configurar la solicitud
      console.error('Error al configurar solicitud:', error.message);
    }
    return Promise.reject(error);
  }
);

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
      console.log('Verificando token de autenticación...');
      const response = await api.get('/auth/check-token');
      console.log('Token verificado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al verificar token:', error.response?.status || error.message);
      throw error;
    }
  },
};

// Servicios de usuarios
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (user) => api.post('/users', user), // Usar el nuevo endpoint para administradores
  update: (id, user) => api.put(`/users/${id}`, user),
  toggleActive: (id, isActive) => api.put(`/users/${id}`, { isActive }),
};

// Servicios de ubicaciones
export const locationService = {
  // Obtener todas las ubicaciones (para administradores)
  getAllLocations: () => api.get('/locations'),
  // Obtener ubicaciones de un usuario específico
  getUserLocations: (userId) => api.get(`/locations/user/${userId}`),
  // Obtener ubicaciones de usuarios activos
  getActiveUserLocations: () => api.get('/users/active-locations'),
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
    api.get(`/activities/admin/all?page=${page}&limit=${limit}&sort=${sort}&exclude=location_check`),
};

export default api;
