import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const DebugInfo = () => {
  const auth = useAuth();
  const [apiStatus, setApiStatus] = useState('No comprobado');
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    // Intentar una llamada simple a la API
    const checkApiConnection = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/auth/check-token`;
        console.log('Intentando conectar con:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setApiStatus('Conectado correctamente');
        } else {
          setApiStatus(`Error HTTP: ${response.status}`);
        }
      } catch (error) {
        console.error('Error al comprobar API:', error);
        setApiStatus('Error de conexión');
        setNetworkError(error.message);
      }
    };
    
    checkApiConnection();
  }, []);

  const handleForceLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      zIndex: 9999 
    }}>
      <Paper elevation={3} sx={{ p: 2, bgcolor: '#2e2e2e', color: 'white', maxWidth: 300 }}>
        <Typography variant="h6" gutterBottom>Información de Depuración</Typography>
        
        <Typography variant="body2">
          <strong>Estado de autenticación:</strong> {auth.isAuthenticated ? 'Autenticado' : 'No autenticado'}
        </Typography>
        
        <Typography variant="body2">
          <strong>Estado de carga:</strong> {auth.loading ? 'Cargando...' : 'Completado'}
        </Typography>
        
        <Typography variant="body2">
          <strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'No definida'}
        </Typography>
        
        <Typography variant="body2">
          <strong>Estado de API:</strong> {apiStatus}
        </Typography>
        
        {networkError && (
          <Typography variant="body2" color="error">
            <strong>Error:</strong> {networkError}
          </Typography>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="error" 
            size="small"
            onClick={handleForceLogin}
          >
            Forzar Login
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            onClick={() => window.location.reload()}
          >
            Recargar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DebugInfo;
