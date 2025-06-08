import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme/theme';
import './theme/customStyles.css'; // Importamos los estilos personalizados

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import TasksPage from './pages/TasksPage';
import LocationsPage from './pages/LocationsPage';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Si está cargando, no renderiza nada todavía
  if (loading) {
    return null;
  }
  
  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si está autenticado, muestra el contenido
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
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
