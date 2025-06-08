import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    
    // Validaciones básicas
    if (!email) {
      setLocalError('El correo electrónico es obligatorio');
      return;
    }
    if (!password) {
      setLocalError('La contraseña es obligatoria');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      console.error('Error en el componente de login:', error);
      // El error global ya será manejado por el contexto de autenticación
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#2e2e2e',
        alignItems: 'center',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: '#2e2e2e', color: '#fff3e5' }}>
            <LockOutlinedIcon />
          </Avatar>
          
          <Typography component="h1" variant="h5" sx={{ mb: 3, color: '#2e2e2e' }}>
            ManageTime Admin
          </Typography>
          
          {(error || localError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {localError || error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.2,
                backgroundColor: '#2e2e2e',
                '&:hover': {
                  backgroundColor: '#1a1a1a',
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="#fff3e5">
            Panel exclusivo para administradores
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
