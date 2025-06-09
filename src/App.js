import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme/theme';
import './theme/customStyles.css'; // Importamos los estilos personalizados
import DebugInfo from './components/DebugInfo'; // Importamos el componente de depuración

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import TasksPage from './pages/TasksPage';
import LocationsPage from './pages/LocationsPage';
import ActivitiesPage from './pages/ActivitiesPage';

// Componente para rutas protegidas con mejor manejo visual
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('ProtectedRoute - Auth State:', { isAuthenticated, loading });
  
  // Si está cargando, muestra un indicador de carga mejorado
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          bgcolor: '#2e2e2e', // Fondo oscuro
          color: '#fff3e5' // Texto claro
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          ManageTime Admin
        </Typography>
        <CircularProgress size={60} sx={{ color: '#fff3e5' }} />
        <Typography variant="body1" sx={{ mt: 3 }}>
          Cargando aplicación...
        </Typography>
      </Box>
    );
  }
  
  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    console.log('Usuario no autenticado. Redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  // Si está autenticado, muestra el contenido
  console.log('Usuario autenticado. Mostrando contenido protegido');
  return children;
};

function App() {
  console.log("App rendering");
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          {/* Componente de depuración que estará presente en todas las rutas */}
          <DebugInfo />
          <Routes>
            {/* Ruta de login pública */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rutas protegidas dentro del layout del dashboard */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard principal */}
              <Route index element={<DashboardPage />} />
              
              {/* Gestión de usuarios */}
              <Route path="users" element={<UsersPage />} />
              
              {/* Gestión de tareas */}
              <Route path="tasks" element={<TasksPage />} />
              
              {/* Control de ubicaciones */}
              <Route path="locations" element={<LocationsPage />} />
              
              {/* Registro de actividades */}
              <Route path="actividades" element={<ActivitiesPage />} />
              
              {/* Redirigir rutas desconocidas al dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            
            {/* Redirigir la raíz al dashboard o login según autenticación */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
