import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingPage = () => {
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
};

export default LoadingPage;
