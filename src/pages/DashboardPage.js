import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { userService, taskService, locationService, activityService } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Componente para mostrar la actividad de usuarios
const ActivityFeed = ({ activities }) => {
  const theme = useTheme();
  return (
    <List sx={{ width: '100%', maxHeight: 400, overflow: 'auto' }}>
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
              }}
            >
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
                      {activity.user?.username || 'Usuario'}
                    </Typography>
                    <Typography sx={{ color: theme.palette.secondary.main, opacity: 0.7 }}>
                      {new Date(activity.createdAt).toLocaleString()}
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

// Función para obtener el título de la actividad
const getActivityTitle = (activity) => {
  const activityTypes = {
    clock_in: 'Disponible',
    clock_out: 'No disponible',
    task_started: 'Inició tarea',
    task_completed: 'Completó tarea',
    location_entered: 'Entró a ubicación',
    location_exited: 'Salió de ubicación',
  };

  return activityTypes[activity.type] || activity.type;
};

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
        Usuarios logueados
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
                      backgroundColor: user.isAvailable ? '#4caf50' : '#ff9800',
                      border: '2px solid #333',
                    }}
                  />
                }
              >
                <Avatar 
                  sx={{ 
                    bgcolor: user.isAvailable ? '#4caf50' : '#ff9800', 
                    mr: 2,
                    color: '#000000',
                    border: `2px solid ${theme.palette.secondary.main}`,
                  }}
                >
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </Badge>
              <ListItemText 
                primary={
                  <Typography sx={{ color: theme.palette.secondary.main }}>
                    {user.username}
                  </Typography>
                } 
                secondary={
                  <Typography sx={{ color: user.isAvailable ? '#4caf50' : '#ff9800' }}>
                    {user.isAvailable ? 'Disponible' : 'No disponible'}
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
  const navigate = useNavigate();
  const theme = useTheme();

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
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

    fetchDashboardData();
    
    // Actualizar datos cada 30 segundos
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manejar clic en un usuario
  const handleUserClick = (user) => {
    navigate(`/usuarios/${user._id}`);
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
            color="#ff9800" 
          />
        </Grid>
      </Grid>
      
      {/* Usuarios y Actividades */}
      <Grid container spacing={3}>
        {/* Lista de usuarios conectados */}
        <Grid item xs={12} md={6}>
          <ConnectedUsers users={users} onUserClick={handleUserClick} />
        </Grid>
        
        {/* Feed de actividad reciente */}
        <Grid item xs={12} md={6}>
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
