import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const navigate = useNavigate();

  // Añadir registro detallado para facilitar depuración
  useEffect(() => {
    console.log('AuthContext montado');
    console.log('API_URL:', process.env.REACT_APP_API_URL);
    
    const initAuth = async () => {
      console.log('Iniciando verificación de autenticación...');
      try {
        // Intentar obtener usuario del localStorage
        const user = authService.getCurrentUser();
        console.log('Usuario en localStorage:', user ? 'Encontrado' : 'No encontrado');
        
        if (user) {
          console.log('Verificando token con backend...');
          try {
            // Verificar token con el backend
            await authService.checkToken();
            console.log('Token verificado correctamente');
            setCurrentUser(user);
          } catch (tokenError) {
            console.error('Error al verificar token:', tokenError);
            console.log('Cerrando sesión por token inválido');
            authService.logout();
          }
        } else {
          console.log('No hay usuario en localStorage, debe iniciar sesión');
        }
      } catch (error) {
        console.error('Error durante la inicialización de autenticación:', error);
        console.log('Cerrando sesión por error de inicialización');
        authService.logout();
      } finally {
        console.log('Finalizada la inicialización de autenticación');
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    initAuth();
    
    // Función de limpieza
    return () => {
      console.log('AuthContext desmontado');
    };
  }, []);

  const login = async (email, password) => {
    console.log('Intentando iniciar sesión...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Enviando solicitud de login al backend...');
      // Aquí enviamos username en lugar de email para compatibilidad con el backend
      // El backend acepta tanto username como email en este campo
      const data = await authService.login({ username: email, password });
      console.log('Respuesta de login recibida:', data ? 'Datos recibidos' : 'Sin datos');
      
      // Verificar si el usuario es administrador
      if (!data.user.isAdmin) {
        console.error('Intento de acceso por usuario no administrador');
        throw new Error('Acceso denegado. Solo administradores pueden acceder a este panel.');
      }
      
      console.log('Login exitoso, guardando usuario en estado');
      setCurrentUser(data.user);
      navigate('/');
      return data.user;
    } catch (error) {
      console.error('Error de inicio de sesión detallado:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error de inicio de sesión';
      
      if (error.response) {
        // El servidor respondió con un código de estado diferente de 2xx
        console.log('Error de respuesta HTTP:', error.response.status);
        if (error.response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.response.status === 401) {
          errorMessage = 'Contraseña incorrecta';
        } else if (error.response.status === 403) {
          errorMessage = 'Acceso denegado. Solo administradores pueden acceder a este panel.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // La solicitud se realizó pero no se recibió respuesta
        console.log('No se recibió respuesta del servidor');
        errorMessage = 'No se pudo conectar al servidor. Comprueba tu conexión.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('Mensaje de error establecido:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      console.log('Finalizando proceso de login');
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Cerrando sesión...');
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
    initialLoadComplete
  };

  // Registro para depuración
  console.log('Estado actual de AuthContext:', { 
    isAuthenticated: !!currentUser,
    loading,
    hasError: !!error,
    initialLoadComplete
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
