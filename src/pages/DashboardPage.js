import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  Paper,
  useTheme
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  AccessTime as PendingIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as AcceptIcon,
  Book as NotesIcon,
  EditNote as EditIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Visibility as ViewIcon,
  DomainVerification as VerifyIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { authService, userService, taskService, activityService, locationService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';

// Función para obtener icono según tipo de actividad
const getActivityIcon = (activity) => {
  const iconStyle = { color: '#f5f5dc', marginRight: '12px', fontSize: '24px', display: 'flex', alignItems: 'center' };
  
  switch (activity.type) {
    case 'task_create':
      return <AddIcon sx={iconStyle} />;
    case 'task_complete':
      return <CompletedIcon sx={iconStyle} />;
    case 'task_delete':
      return <DeleteIcon sx={iconStyle} />;
    case 'task_update':
      return <EditIcon sx={iconStyle} />;
    case 'task_accept':
      return <AcceptIcon sx={iconStyle} />;
    case 'task_activity':
      return <TaskIcon sx={iconStyle} />;
    case 'notes':
    case 'NOTES':
    case 'bitacora':
      return <NotesIcon sx={iconStyle} />;
    case 'user_login':
      return <LoginIcon sx={iconStyle} />;
    case 'user_logout':
      return <LogoutIcon sx={iconStyle} />;
    case 'location_check':
      return <LocationIcon sx={iconStyle} />;
    case 'location_verify':
      return <VerifyIcon sx={iconStyle} />;
    default:
      return <FlagIcon sx={iconStyle} />;
  }
};

// Función para obtener título descriptivo de la actividad
const getActivityTitle = (activity) => {
  switch (activity.type) {
    case 'task_create':
      return 'Tarea creada';
    case 'task_complete':
      return 'Tarea completada';
    case 'task_delete':
      return 'Tarea eliminada';
    case 'task_update':
      return 'Tarea actualizada';
    case 'task_accept':
      return 'Tarea aceptada';
    case 'task_activity':
      return 'Actividad de tarea';
    case 'notes':
      return 'NOTAS';
    case 'user_login':
      return 'Inicio de sesión';
    case 'user_logout':
      return 'Cierre de sesión';
    case 'location_check':
      return 'Verificación de ubicación';
    case 'location_verify':
      return 'Ubicación verificada';
    default:
      return activity.type?.replace(/_/g, ' ') || 'Actividad desconocida';
  }
};

// Componente para mostrar la actividad de usuarios
const ActivityFeed = ({ activities }) => {
  const theme = useTheme();
  return (
    <List sx={{ width: '100%', maxHeight: 400, overflow: 'auto', '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'rgba(245, 245, 220, 0.1)',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.secondary.main,
        borderRadius: '4px',
      } }}>
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <React.Fragment key={activity._id || index}>
            <ListItem 
              alignItems="flex-start"
              sx={{ 
                borderRadius: '8px',
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 243, 229, 0.1)',
                },
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '40px', justifyContent: 'center' }}>
                {getActivityIcon(activity)}
              </Box>
              <ListItemText
                primary={
                  <Typography sx={{ color: theme.palette.secondary.main, fontWeight: 500 }}>
                    {getActivityTitle(activity)}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ display: 'block', color: theme.palette.secondary.main, opacity: 0.9 }}
                    >
                      {activity.userId?.username || activity.username || 'Usuario'}
                    </Typography>
                    <Typography sx={{ color: theme.palette.secondary.main, opacity: 0.7 }}>
                      {new Date(activity.createdAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < activities.length - 1 && 
              <Divider 
                variant="inset" 
                component="li" 
                sx={{ backgroundColor: 'rgba(255, 243, 229, 0.2)' }} 
              />}
          </React.Fragment>
        ))
      ) : (
        <ListItem>
          <ListItemText 
            primary={
              <Typography sx={{ color: theme.palette.secondary.main }}>
                No hay actividades recientes
              </Typography>
            } 
          />
        </ListItem>
      )}
    </List>
  );
};

// La función getActivityTitle ya está definida arriba

// Componente para tarjetas de estadísticas
const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        } 
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar 
              sx={{ 
                bgcolor: color, 
                width: 56, 
                height: 56,
                color: color === theme.palette.primary.main ? theme.palette.secondary.main : '#000000',
                border: `2px solid ${theme.palette.secondary.main}`,
              }}
            >
              {icon}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ color: theme.palette.secondary.main, opacity: 0.9 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ color: theme.palette.secondary.main }}
            >
              {value}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Componente para mostrar usuarios conectados
const ConnectedUsers = ({ users, onUserClick }) => {
  const theme = useTheme();
  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%', 
        maxHeight: 400, 
        overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#f5f5dc #333',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#333',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#f5f5dc',
          borderRadius: '4px',
        },
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: '12px',
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          color: theme.palette.secondary.main,
          borderBottom: `1px solid ${theme.palette.secondary.main}`,
          paddingBottom: 1,
          marginBottom: 2
        }}
      >
        Usuarios Activos
      </Typography>
      <List>
        {users.length > 0 ? (
          users.map((user) => (
            <ListItem 
              key={user._id} 
              button 
              onClick={() => onUserClick(user)}
              sx={{ 
                mb: 1, 
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 243, 229, 0.1)',
                },
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#4caf50',
                      border: '2px solid #333',
                    }}
                  />
                }
              >
                <Avatar 
                  sx={{ 
                    bgcolor: '#333333', 
                    mr: 2,
                    color: '#f5f5dc',
                    border: `2px solid ${theme.palette.secondary.main}`,
                  }}
                >
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </Badge>
              <ListItemText 
                primary={
                  <Typography sx={{ color: '#f5f5dc' }}>
                    {user.username}
                  </Typography>
                } 
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText 
              primary={
                <Typography sx={{ color: theme.palette.secondary.main }}>
                  No hay usuarios conectados
                </Typography>
              } 
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: -34.61315, lng: -58.37723 }); // Centro del mapa (Buenos Aires por defecto)
  const [userLocations, setUserLocations] = useState({}); // Mapa de ubicaciones de usuarios por ID
  const [selectedUserId, setSelectedUserId] = useState(null); // ID del usuario seleccionado para destacar su marcador
  const navigate = useNavigate();
  const theme = useTheme();

  // Intervalo de referencia para las ubicaciones en tiempo real
  const locationIntervalRef = useRef(null);
  const mapRef = useRef(null);

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Iniciando carga de datos del dashboard...');
        
        // Obtener usuarios
        const usersRes = await userService.getAll();
        const activeUsersCount = usersRes.data.filter(user => user.isActive).length;
        setUsers(usersRes.data);
        
        // Obtener tareas
        const tasksRes = await taskService.getAll();
        const completedTasksCount = tasksRes.data.filter(task => task.completed).length;
        const pendingTasksCount = tasksRes.data.filter(task => !task.completed).length;
        
        // Obtener actividades recientes
        const activitiesRes = await activityService.getAdminActivities(1, 10);
        setActivities(activitiesRes.data.activities || []);
        
        // Actualizar estadísticas
        setStats({
          totalUsers: usersRes.data.length,
          activeUsers: activeUsersCount,
          totalTasks: tasksRes.data.length,
          completedTasks: completedTasksCount,
          pendingTasks: pendingTasksCount,
        });
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    // Cargar datos una sola vez sin intervalo de actualización automática
    fetchDashboardData();
    
    // Cargar las ubicaciones inicialmente
    loadActiveUserLocations();
    
    // Configurar actualización de ubicaciones cada 15 segundos
    locationIntervalRef.current = setInterval(() => {
      console.log('Actualizando ubicaciones en tiempo real...');
      loadActiveUserLocations(true);
    }, 15000);
    
    return () => {
      // Limpiar el intervalo cuando el componente se desmonte
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);

  // Cargar ubicaciones de usuarios activos - implementando lógica de AdminDashboardScreen.js
  const loadActiveUserLocations = async (silent = false) => {
    try {
      if (!silent) {
        console.log('Iniciando carga de ubicaciones en tiempo real...');
      }
      
      // 1. Obtener ubicaciones en tiempo real
      console.log('Obteniendo ubicaciones de usuarios activos desde la API...');
      const response = await locationService.getActiveUserLocations();
      
      if (!response || !response.data) {
        console.error('La respuesta de ubicaciones activas está vacía o es inválida:', response);
        return;
      }
      
      // Imprimir la respuesta completa para depuración
      console.log('Datos de la respuesta (tipo):', typeof response.data);
      console.log('Estructura de la respuesta:', JSON.stringify(response.data, null, 2));
      
      // Determinar la estructura de la respuesta y obtener el array de ubicaciones
      let locationsArray = [];
      
      if (Array.isArray(response.data)) {
        // Si la respuesta ya es un array
        console.log('La respuesta es directamente un array de ubicaciones');
        locationsArray = response.data;
      } else if (response.data.locations && Array.isArray(response.data.locations)) {
        // Si la respuesta es un objeto con una propiedad 'locations' que es un array
        console.log('La respuesta tiene un objeto con propiedad locations');
        locationsArray = response.data.locations;
      } else {
        // Comprobar si es un objeto con propiedades no esperadas
        console.log('Estructura de respuesta desconocida, intentando extraer datos...');
        
        // Si es un objeto con datos de ubicación directamente
        if (response.data.userId || response.data._id) {
          locationsArray = [response.data];
        } else {
          // Último intento: ver si es un objeto con propiedades que son ubicaciones
          const keys = Object.keys(response.data);
          if (keys.length > 0) {
            // Intentar convertir el objeto en array
            locationsArray = Object.values(response.data);
            console.log('Convertido objeto a array con ' + locationsArray.length + ' elementos');
          }
        }
      }
      
      // Si no pudimos obtener un array, salir
      if (!Array.isArray(locationsArray) || locationsArray.length === 0) {
        console.log('No se pudo obtener un array de ubicaciones válido');
        return;
      }
      
      console.log(`Ubicaciones obtenidas: ${locationsArray.length}`);
      console.log('Primera ubicación de ejemplo:', JSON.stringify(locationsArray[0], null, 2));
      
      // 2. Procesar datos de ubicación
      const locationsMap = {};
      
      console.log('Procesando ubicaciones recibidas...');
      locationsArray.forEach(location => {
        // Manejo de formato de MongoDB que vimos en la estructura proporcionada
        if (!location) return;
        
        // Extraer userId
        const userId = typeof location.userId === 'object' ? location.userId._id : String(location.userId);
        if (!userId) {
          console.warn('Ubicación sin userId:', location);
          return;
        }
        
        // Extraer coordenadas (manejo flexible del formato)
        let lat, lng;
        if (location.coords) {
          // Formato app móvil: { coords: { latitude, longitude } }
          lat = location.coords.latitude;
          lng = location.coords.longitude;
        } else if (location.latitude !== undefined && location.longitude !== undefined) {
          // Formato MongoDB directo: { latitude, longitude }
          lat = location.latitude;
          lng = location.longitude;
        } else {
          console.warn('Ubicación sin coordenadas válidas:', location);
          return;
        }
        
        console.log(`Ubicación para usuario ${userId}: Lat ${lat}, Lng ${lng}`);
        
        // Adaptar al formato esperado por nuestro código
        const formattedLocation = {
          userId: userId,
          timestamp: location.timestamp || location.createdAt || new Date().toISOString(),
          coords: {
            latitude: lat,
            longitude: lng
          }
        };
        
        // Solo guardar la ubicación más reciente para cada usuario
        if (!locationsMap[userId] || 
            new Date(formattedLocation.timestamp) > new Date(locationsMap[userId].timestamp)) {
          locationsMap[userId] = formattedLocation;
        }
      });
      
      // 3. Actualizar el estado con las ubicaciones procesadas
      console.log(`Total de ubicaciones únicas procesadas: ${Object.keys(locationsMap).length}`);
      setUserLocations(locationsMap);
    } catch (error) {
      console.error('Error al cargar ubicaciones de usuarios activos:', error);
      console.error('Detalles del error:', error.message, error.stack);
    }
  };



  // Manejar clic en un usuario
  const handleUserClick = (user) => {
    console.log(`Usuario seleccionado: ${user.username} (${user._id})`);
    
    // Establecer el ID del usuario seleccionado para destacar su marcador
    setSelectedUserId(user._id);
    
    // Obtener la ubicación del usuario
    const userLocation = userLocations[user._id];
    console.log('Datos de ubicación encontrados:', userLocation);
    
    if (userLocation && userLocation.coords) {
      // Centrar el mapa en la ubicación del usuario
      const center = {
        lat: userLocation.coords.latitude,
        lng: userLocation.coords.longitude
      };
      
      console.log(`Centrando mapa en: Lat ${center.lat}, Lng ${center.lng}`);
      setMapCenter(center);
      
      // Mostrar mensaje de éxito
      console.log(`✅ Mapa centrado en la ubicación de ${user.username}`);
    } else {
      console.warn(`⚠️ No hay ubicación disponible para el usuario ${user.username}`);
      alert(`No hay datos de ubicación disponibles para ${user.username}`);
      setSelectedUserId(null); // Limpiar selección si no hay ubicación 
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: theme.palette.secondary.main,
          borderBottom: `2px solid ${theme.palette.secondary.main}`,
          paddingBottom: 1,
          marginBottom: 3,
          fontWeight: 'bold'
        }}
      >
        Panel de Control
      </Typography>
      
      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Total de Usuarios" 
            value={stats.totalUsers} 
            icon={<PeopleIcon sx={{ fontSize: 30, color: theme.palette.secondary.main }} />} 
            color={theme.palette.primary.main} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Tareas Completadas" 
            value={stats.completedTasks} 
            icon={<CompletedIcon sx={{ fontSize: 30 }} />}
            color="#4caf50" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Tareas Pendientes" 
            value={stats.pendingTasks} 
            icon={<PendingIcon sx={{ fontSize: 30 }} />}
            color="#777777" 
          />
        </Grid>
      </Grid>
      
      {/* Usuarios, Mapa y Actividades en una sola fila */}
      <Grid container spacing={3}>
        {/* Lista de usuarios conectados */}
        <Grid item xs={12} md={3}>
          <ConnectedUsers users={users} onUserClick={handleUserClick} />
        </Grid>
        
        {/* Mapa de ubicaciones en el medio */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          <MapComponent
            center={mapCenter}
            zoom={14} // Zoom más cercano para ver mejor las ubicaciones
            selectedUserId={selectedUserId} // Pasar el ID del usuario seleccionado
            markers={[
              // Convertir las ubicaciones de usuarios a marcadores
              ...Object.values(userLocations)
                .filter(loc => {
                  if (!loc || !loc.coords) {
                    console.warn('Ubicación sin coordenadas:', loc);
                    return false;
                  }
                  return true;
                })
                .map(loc => {
                  const userId = typeof loc.userId === 'object' ? loc.userId._id : String(loc.userId);
                  const user = users.find(u => u._id === userId);
                  console.log(`Creando marcador para: ${user?.username || 'Usuario desconocido'} en Lat ${loc.coords.latitude}, Lng ${loc.coords.longitude}`);
                  return {
                    lat: loc.coords.latitude,
                    lng: loc.coords.longitude,
                    userId: userId, // Agregar userId para identificar el marcador seleccionado
                    title: user?.username || 'Usuario'
                  };
                })
            ]}
            ref={mapRef}
          />
        </Grid>
        
        {/* Feed de actividad reciente */}
        <Grid item xs={12} md={3}>
          <Paper 
            sx={{ 
              p: 2, 
              height: '100%',
              border: `1px solid ${theme.palette.secondary.main}`,
              borderRadius: '12px',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: theme.palette.secondary.main,
                borderBottom: `1px solid ${theme.palette.secondary.main}`,
                paddingBottom: 1,
                marginBottom: 2
              }}
            >
              Actividad Reciente
            </Typography>
            <ActivityFeed activities={activities} />
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/actividades')}
                sx={{ 
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 243, 229, 0.1)',
                  }
                }}
              >
                Ver todas las actividades
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
