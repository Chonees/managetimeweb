import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon,
  History as HistoryIcon,
  MyLocation as LocationIcon,
} from '@mui/icons-material';
import { userService, locationService } from '../services/api';

// Fix para los íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Crear iconos personalizados para entrada/salida
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para controlar el mapa y hacerle zoom a una ubicación específica
const MapControl = ({ selectedLocation }) => {
  const map = useMap(); // Hook de react-leaflet para acceder al mapa
  
  useEffect(() => {
    if (selectedLocation) {
      const lat = parseFloat(selectedLocation.latitude);
      const lng = parseFloat(selectedLocation.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Hacer zoom a la ubicación seleccionada
        map.setView([lat, lng], 17, {
          animate: true,
          duration: 1
        });
      }
    }
  }, [map, selectedLocation]);

  return null;
};

// Componente para mostrar el mapa con las ubicaciones utilizando Leaflet
const LocationMap = ({ locations, activeUsers, selectedLocation }) => {
  const [mapCenter, setMapCenter] = useState([-34.603722, -58.381592]);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Procesar y actualizar marcadores cuando cambian las ubicaciones
  useEffect(() => {
    if (locations.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      // Procesar ubicaciones
      const validLocations = locations.filter(location => {
        const lat = parseFloat(location.latitude);
        const lng = parseFloat(location.longitude);
        return !isNaN(lat) && !isNaN(lng);
      });

      if (validLocations.length > 0) {
        // Establecer centro del mapa inicial
        const firstLocation = validLocations[0];
        setMapCenter([parseFloat(firstLocation.latitude), parseFloat(firstLocation.longitude)]);
        
        // Crear marcadores
        const locationMarkers = validLocations.map(location => {
          // Encontrar información del usuario
          const user = activeUsers.find(u => u._id === location.userId);
          const username = user ? user.username : 'Usuario desconocido';
          
          // Determinar el tipo de marcador
          const isEntry = location.type === 'start' || location.type === 'clock_in';
          
          return {
            id: location._id,
            position: [parseFloat(location.latitude), parseFloat(location.longitude)],
            username,
            isEntry,
            timestamp: location.timestamp,
            originalLocation: location
          };
        });
        
        setMarkers(locationMarkers);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error al procesar las ubicaciones:', error);
      setIsLoading(false);
    }
  }, [locations, activeUsers]);

  if (isLoading) {
    return (
      <Box
        sx={{ 
          width: '100%', 
          height: 500, 
          bgcolor: 'grey.300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{ 
        width: '100%', 
        height: 500
      }}
    >
      <MapContainer 
        center={mapCenter} 
        zoom={zoomLevel} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapControl selectedLocation={selectedLocation} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {markers.map(marker => (
          <Marker 
            key={marker.id} 
            position={marker.position}
            icon={marker.isEntry ? greenIcon : redIcon}
          >
            <Popup>
              <div>
                <h3>{marker.username}</h3>
                <p>Tipo: {marker.isEntry ? 'Entrada' : 'Salida'}</p>
                <p>Fecha: {new Date(marker.timestamp).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};


// Página principal de ubicaciones
const LocationsPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar usuarios al iniciar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAll();
        setUsers(response.data);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        showSnackbar('Error al cargar usuarios', 'error');
      }
    };

    fetchUsers();
  }, []);

  // Cargar ubicaciones según filtros
  useEffect(() => {
    fetchLocations();
  }, [selectedUser, timeRange]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      let response;

      if (selectedUser === 'all') {
        response = await locationService.getAllLocations();
      } else {
        response = await locationService.getUserLocations(selectedUser);
      }

      let filteredLocations = response.data;

      // Aplicar filtro de fecha según el rango seleccionado
      if (timeRange !== 'all') {
        const now = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0); // Inicio del día actual
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          default:
            break;
        }
        
        filteredLocations = filteredLocations.filter(location => {
          const locationDate = new Date(location.timestamp);
          return locationDate >= startDate && locationDate <= now;
        });
      }

      // Ordenar por fecha, más reciente primero
      filteredLocations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setLocations(filteredLocations);
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
      showSnackbar('Error al cargar ubicaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar mensaje de notificación
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Manejar cierre de notificación
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Formato de fecha para la lista de ubicaciones
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Función para obtener el nombre de usuario por ID
  const getUsernameById = (userId) => {
    const user = users.find(user => user._id === userId);
    return user ? user.username : 'Usuario desconocido';
  };

  // Función para obtener descripción del tipo de ubicación
  const getLocationTypeText = (type) => {
    const types = {
      'start': 'Entrada a ubicación',
      'end': 'Salida de ubicación',
      'clock_in': 'Disponible',
      'clock_out': 'No disponible'
    };
    return types[type] || type;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Control de Ubicaciones
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Usuario</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Usuario"
              >
                <MenuItem value="all">Todos los usuarios</MenuItem>
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Rango de tiempo</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Rango de tiempo"
              >
                <MenuItem value="today">Hoy</MenuItem>
                <MenuItem value="week">Última semana</MenuItem>
                <MenuItem value="month">Último mes</MenuItem>
                <MenuItem value="all">Todo el historial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLocations}
              fullWidth
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Mapa de ubicaciones */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Mapa de Ubicaciones
            </Typography>
            <Box sx={{ mb: 3 }}>
              <LocationMap 
                locations={locations} 
                activeUsers={users} 
                selectedLocation={selectedLocation}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    component="span"
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      bgcolor: 'success.main', 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      mr: 1 
                    }}
                  />
                  <Typography variant="body2">Entrada/Disponible</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    component="span"
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      bgcolor: 'error.main', 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      mr: 1 
                    }}
                  />
                  <Typography variant="body2">Salida/No disponible</Typography>
                </Box>
              </Box>
              <Typography variant="body2">
                Total: {locations.length} registros
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Lista de ubicaciones recientes */}
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Historial de Ubicaciones
              </Typography>
              <Tooltip title="Filtrar">
                <IconButton>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : locations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No se encontraron registros de ubicaciones</Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {locations.map((location) => (
                  <ListItem
                    key={location._id}
                    divider
                    secondaryAction={
                      <Tooltip title="Centrar en el mapa">
                        <IconButton 
                          edge="end" 
                          aria-label="centrar en el mapa"
                          onClick={() => setSelectedLocation(location)}
                        >
                          <LocationIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            component="span"
                            sx={{ 
                              width: 10, 
                              height: 10, 
                              bgcolor: location.type === 'start' || location.type === 'clock_in' ? 'success.main' : 'error.main', 
                              borderRadius: '50%', 
                              display: 'inline-block',
                              mr: 1 
                            }}
                          />
                          <Typography component="span" variant="subtitle1">
                            {getUsernameById(location.userId)} - {getLocationTypeText(location.type)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {formatDate(location.timestamp)}
                          </Typography>
                          <Typography component="span" variant="body2" display="block">
                            Lat: {location.latitude}, Lng: {location.longitude}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LocationsPage;
