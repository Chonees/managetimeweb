import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Grid,
  IconButton,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as AcceptIcon,
  Book as NotesIcon,
  EditNote as EditIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  DomainVerification as VerifyIcon,
  Flag as FlagIcon,
  CheckCircle as CompletedIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import { activityService } from '../services/api';

// Función para obtener título según tipo de actividad
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

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const theme = useTheme();

  // Cargar actividades
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await activityService.getAdminActivities(
          pagination.currentPage,
          pagination.limit
        );
        
        console.log('Actividades recibidas:', response.data);
        
        const activitiesData = response.data.activities || [];
        setActivities(activitiesData);
        setAllActivities(activitiesData);
        setPagination({
          ...pagination,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1,
        });
        
        // Extraer usuarios únicos para el filtro
        const users = activitiesData.reduce((acc, activity) => {
          const username = activity.userId?.username || activity.username;
          if (username && !acc.includes(username)) {
            acc.push(username);
          }
          return acc;
        }, []);
        setUniqueUsers(users);
      } catch (error) {
        console.error('Error al cargar actividades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [pagination.currentPage, pagination.limit]);
  
  // Filtrar actividades basado en búsqueda y usuario seleccionado
  useEffect(() => {
    if (!searchTerm && selectedUser === 'all') {
      setActivities(allActivities);
      return;
    }
    
    const filtered = allActivities.filter(activity => {
      // Filtro por texto de búsqueda
      const searchMatches = searchTerm ? (
        // Buscar en varios campos
        (activity.type && activity.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.message && activity.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.taskId?.fileNumber && activity.taskId.fileNumber.toString().includes(searchTerm)) ||
        (activity.taskId?.title && activity.taskId.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.taskId?.description && activity.taskId.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.taskId?.locationName && activity.taskId.locationName.toLowerCase().includes(searchTerm.toLowerCase()))
      ) : true;
      
      // Filtro por usuario
      const userMatches = selectedUser !== 'all' ? (
        (activity.userId?.username === selectedUser) || (activity.username === selectedUser)
      ) : true;
      
      return searchMatches && userMatches;
    });
    
    setActivities(filtered);
  }, [searchTerm, selectedUser, allActivities]);

  const handlePageChange = (event, value) => {
    setPagination({
      ...pagination,
      currentPage: value,
    });
  };

  if (loading && activities.length === 0) {
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
          marginBottom: 2,
          fontWeight: 'bold'
        }}
      >
        Registro de Actividades
      </Typography>
      
      {/* Filtros de búsqueda */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por texto, número o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.secondary.main }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm('')} size="small">
                    <ClearIcon sx={{ color: theme.palette.secondary.main }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: { 
                color: theme.palette.secondary.main,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.secondary.main,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.secondary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.secondary.main,
                }
              }
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="user-filter-label" sx={{ color: theme.palette.secondary.main }}>
              Filtrar por Usuario
            </InputLabel>
            <Select
              labelId="user-filter-label"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Filtrar por Usuario"
              sx={{ 
                color: theme.palette.secondary.main,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.secondary.main,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.secondary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.secondary.main,
                }
              }}
            >
              <MenuItem value="all">Todos los usuarios</MenuItem>
              {uniqueUsers.map((username) => (
                <MenuItem key={username} value={username}>{username}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Paper 
        sx={{ 
          p: 2,
          border: `1px solid ${theme.palette.secondary.main}`,
          borderRadius: '12px',
        }}
      >
        <List 
          sx={{ 
            width: '100%', 
            bgcolor: 'background.paper',
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
          }}
        >
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <React.Fragment key={activity._id || index}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    p: 2,
                    borderRadius: '8px',
                    mb: 2,
                    backgroundColor: 'rgba(32, 32, 32, 0.6)',
                    '&:hover': {
                      backgroundColor: 'rgba(45, 45, 45, 0.8)',
                    },
                    transition: 'background-color 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '40px', justifyContent: 'center', mr: 1 }}>
                    {getActivityIcon(activity)}
                  </Box>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: theme.palette.secondary.main, fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          {getActivityTitle(activity)}
                          {activity.taskId && activity.taskId.fileNumber && 
                            <span style={{ marginLeft: '8px', color: '#f5f5dc', backgroundColor: '#555', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>#{activity.taskId.fileNumber}</span>
                          }
                        </span>
                        <span style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>
                          {new Date(activity.createdAt).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ display: 'block', color: '#f5f5dc', mb: 0.5 }}
                        >
                          {activity.userId?.username || activity.username || 'Usuario'}
                        </Typography>
                        {activity.message && (
                          <Typography sx={{ color: theme.palette.secondary.main, opacity: 0.8 }}>
                            {activity.message}
                          </Typography>
                        )}
                        {activity.taskId && (
                          <React.Fragment>
                            <Typography sx={{ color: theme.palette.secondary.main, opacity: 0.7, fontWeight: 'bold' }}>
                              Tarea {activity.taskId.fileNumber ? `#${activity.taskId.fileNumber}` : ''}: {activity.taskId.title || 'Sin título'}
                            </Typography>
                            {activity.taskId.status && (
                              <Typography sx={{ color: theme.palette.secondary.main, opacity: 0.7, fontSize: '0.9rem' }}>
                                Estado: {activity.taskId.status.replace(/_/g, ' ').toUpperCase()}
                                {activity.taskId.completed ? ' (COMPLETADA)' : ''}
                                {activity.taskId.locationName ? ` - Ubicación: ${activity.taskId.locationName}` : ''}
                              </Typography>
                            )}
                          </React.Fragment>
                        )}
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
                    No se encontraron actividades
                  </Typography>
                } 
              />
            </ListItem>
          )}
        </List>
        
        {pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={pagination.pages} 
              page={pagination.currentPage} 
              onChange={handlePageChange}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: theme.palette.secondary.main,
                },
                '& .Mui-selected': {
                  backgroundColor: 'rgba(255, 243, 229, 0.2)',
                }
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ActivitiesPage;
