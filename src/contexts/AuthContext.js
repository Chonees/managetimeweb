import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = authService.getCurrentUser();
        if (user) {
          // Verificar token con el backend
          await authService.checkToken();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error durante la inicialización de autenticación:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Aquí enviamos username en lugar de email para compatibilidad con el backend
      // El backend acepta tanto username como email en este campo
      const data = await authService.login({ username: email, password });
      
      // Verificar si el usuario es administrador
      if (!data.user.isAdmin) {
        throw new Error('Acceso denegado. Solo administradores pueden acceder a este panel.');
      }
      
      setCurrentUser(data.user);
      navigate('/');
      return data.user;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error de inicio de sesión';
      
      if (error.response) {
        // El servidor respondió con un código de estado diferente de 2xx
        if (error.response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.response.status === 401) {
          errorMessage = 'Contraseña incorrecta';
        } else if (error.response.status === 403) {
          errorMessage = 'Acceso denegado. Solo administradores pueden acceder a este panel.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
