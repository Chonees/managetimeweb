import React, { useState, useEffect, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import { 
  Box, 
  Paper, 
  Typography, 
  useTheme, 
  Slider, 
  TextField, 
  InputAdornment, 
  IconButton,
  CircularProgress,
  Tooltip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// Componente para el marcador central
const CenterMarker = () => (
  <div style={{ 
    position: 'absolute', 
    transform: 'translate(-50%, -50%)', 
    zIndex: 2 
  }}>
    <LocationOnIcon sx={{ 
      color: '#FF5252', 
      fontSize: 40,
      filter: 'drop-shadow(0px 0px 8px rgba(0,0,0,0.5))',
      animation: 'pulse 1.5s infinite'
    }} />
    
  </div>
);

// Componente para visualizar el perímetro
// Componente para visualizar el radio del perímetro
const PerimeterCircle = ({ mapInstance, mapsApi, center, radius }) => {
  const [circle, setCircle] = useState(null);

  useEffect(() => {
    // Limpiar círculo anterior si existe
    if (circle) {
      circle.setMap(null);
    }

    // Si tenemos la API de mapas y coordenadas válidas, crear círculo
    if (mapInstance && mapsApi && center && center.lat && center.lng) {
      const newCircle = new mapsApi.Circle({
        strokeColor: '#FF5252',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF5252',
        fillOpacity: 0.2,
        map: mapInstance,
        center: center,
        // Radio en metros (convertimos de km)
        radius: radius * 1000,
        // Animación del círculo al cambiar de tamaño
        animation: mapsApi.Animation ? mapsApi.Animation.DROP : null
      });
      
      setCircle(newCircle);
    }

    return () => {
      if (circle) {
        circle.setMap(null);
      }
    };
  }, [mapInstance, mapsApi, center, radius]);

  return null; // Este es un componente funcional, no renderiza nada directamente
};

const TaskPerimeterMap = ({ location, radius, onChange }) => {
  const theme = useTheme();
  const searchInputRef = useRef(null);
  const [apiKey, setApiKey] = useState('');
  const [mapCenter, setMapCenter] = useState({ 
    lat: location?.latitude || -34.61315, 
    lng: location?.longitude || -58.37723 
  });
  const [mapInstance, setMapInstance] = useState(null);
  const [mapsApi, setMapsApi] = useState(null);
  const [perimeterRadius, setPerimeterRadius] = useState(radius || 1.0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [geocoder, setGeocoder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationName, setLocationName] = useState(location?.name || '');
  
  // Actualizar cuando cambian las props
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setMapCenter({ 
        lat: parseFloat(location.latitude), 
        lng: parseFloat(location.longitude) 
      });
      setLocationName(location.name || '');
    }
    
    if (radius) {
      setPerimeterRadius(radius);
    }
  }, [location, radius]);
  
  // Cargar la clave API al montar el componente
  useEffect(() => {
    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    console.log("Google Maps API Key status:", key ? "Defined" : "Undefined");
    
    if (key) {
      setApiKey(key);
    } else {
      console.error("Google Maps API Key not found in environment variables");
    }
  }, []);
  
  // Inicializar el geocoder cuando la API esté cargada
  useEffect(() => {
    if (mapsApi) {
      setGeocoder(new mapsApi.Geocoder());
    }
  }, [mapsApi]);
  
  // Realizar búsqueda inversa para obtener nombre de la ubicación cuando se mueve el mapa
  const handleReverseGeocode = (lat, lng) => {
    if (!geocoder) return;
    
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const name = results[0].formatted_address;
        setLocationName(name);
        if (onChange) {
          onChange({
            location: {
              latitude: lat,
              longitude: lng,
              name: name,
              coordinates: [lng, lat] // GeoJSON format [lng, lat]
            }
          });
        }
      } else {
        setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        if (onChange) {
          onChange({
            location: {
              latitude: lat,
              longitude: lng,
              name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              coordinates: [lng, lat]
            }
          });
        }
      }
    });
  };
  
  // Búsqueda por dirección o nombre de lugar
  const handleSearch = () => {
    if (!geocoder || !searchQuery.trim()) return;
    
    setIsSearching(true);
    setErrorMessage('');
    
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false);
      
      if (status === 'OK' && results[0]) {
        const position = results[0].geometry.location;
        const lat = position.lat();
        const lng = position.lng();
        const name = results[0].formatted_address;
        
        setMapCenter({ lat, lng });
        setLocationName(name);
        
        if (onChange) {
          onChange({
            location: {
              latitude: lat,
              longitude: lng,
              name: name,
              coordinates: [lng, lat]
            }
          });
        }
        
        if (mapInstance) {
          mapInstance.setCenter({ lat, lng });
          mapInstance.setZoom(15);
        }
      } else {
        setErrorMessage(`No se encontró la ubicación: "${searchQuery}"`);
      }
    });
  };
  
  // Detectar ubicación actual del usuario
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setMapCenter({ lat, lng });
          if (mapInstance) {
            mapInstance.setCenter({ lat, lng });
            mapInstance.setZoom(15);
          }
          
          handleReverseGeocode(lat, lng);
          setIsSearching(false);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setErrorMessage("No se pudo acceder a su ubicación actual");
          setIsSearching(false);
        }
      );
    } else {
      setErrorMessage("Su navegador no soporta geolocalización");
    }
  };

  // Manejar cambio en el radio del perímetro
  const handleRadiusChange = (event, newValue) => {
    setPerimeterRadius(newValue);
    if (onChange) {
      onChange({
        radius: newValue
      });
    }
  };
  
  // Manejar click en el mapa para establecer ubicación
  const handleMapClick = ({ lat, lng }) => {
    setMapCenter({ lat, lng });
    handleReverseGeocode(lat, lng);
  };

  // Estilo personalizado para el mapa
  const mapStyles = [
    { 
      featureType: 'all', 
      elementType: 'all',
      stylers: [{ saturation: -10 }] 
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'simplified' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#4d90fe', lightness: 50 }]
    }
  ];

  return (
    <Box sx={{ 
      width: '100%',
      bgcolor: '#333333',
      borderRadius: '4px',
      overflow: 'visible',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      mb: 3,
    }}>
      <Box sx={{ p: 2, bgcolor: '#333333', color: 'white', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              bgcolor: '#444444', 
              borderRadius: '4px', 
              width: '100%', 
              overflow: 'hidden' 
            }}>
              <Tooltip title="Usar mi ubicación actual">
                <IconButton 
                  onClick={handleGetCurrentLocation} 
                  sx={{ color: 'white', mx: 1 }}
                >
                  <MyLocationIcon />
                </IconButton>
              </Tooltip>
              <TextField
                fullWidth
                placeholder="Buscar ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                inputRef={searchInputRef}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {isSearching ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        <IconButton onClick={handleSearch} edge="end" sx={{ color: 'white' }}>
                          <SearchIcon />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                  disableUnderline: true
                }}
                variant="standard"
                size="medium"
                sx={{ 
                  input: { color: 'white', py: 1, px: 0 },
                  '& .MuiInputBase-root': { 
                    bgcolor: 'transparent',
                    '&:before, &:after': { display: 'none' }
                  }
                }}
              />
            </Box>
          </Box>
          {errorMessage && (
            <Typography sx={{ color: '#ff6b6b', fontSize: '0.75rem', px: 1 }}>
              {errorMessage}
            </Typography>
          )}
          
          {locationName && (
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#cccccc' }}>
              Ubicación: {locationName}
            </Typography>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Typography id="radius-slider" gutterBottom variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
              Radio: {perimeterRadius.toFixed(1)} km
            </Typography>
            <Slider
              value={perimeterRadius}
              onChange={handleRadiusChange}
              aria-labelledby="radius-slider"
              min={0.1}
              max={10}
              step={0.1}
              sx={{ 
                color: '#4CAF50',
                '& .MuiSlider-mark': {
                  backgroundColor: '#888888',
                  height: 8,
                  width: 1,
                  marginTop: -3
                },
                '& .MuiSlider-valueLabel': {
                  backgroundColor: '#4CAF50'
                }
              }}
              marks={[
                { value: 0.1, label: '0.1' },
                { value: 1, label: '1 km' },
                { value: 5, label: '5 km' },
                { value: 10, label: '10 km' },
              ]}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ height: '550px', width: '100%', p: 1 }}>
        {apiKey ? (
          <GoogleMapReact
            bootstrapURLKeys={{ key: apiKey }}
            defaultCenter={mapCenter}
            defaultZoom={14}
            options={{
              styles: mapStyles,
              fullscreenControl: true,
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: true,
            }}
            onClick={handleMapClick}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => {
              console.log("Google Maps API loaded for task perimeter");
              setMapInstance(map);
              setMapsApi(maps);
            }}
          >
            <CenterMarker
              lat={mapCenter.lat}
              lng={mapCenter.lng}
            />
            {mapInstance && mapsApi && (
              <PerimeterCircle
                mapInstance={mapInstance}
                mapsApi={mapsApi}
                center={mapCenter}
                radius={perimeterRadius}
              />
            )}
          </GoogleMapReact>
        ) : (
          <Box sx={{ 
            p: 2, 
            color: '#cccccc', 
            bgcolor: '#333333',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column'
          }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              API Key de Google Maps no configurada
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Verifica la variable REACT_APP_GOOGLE_MAPS_API_KEY en el archivo .env
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TaskPerimeterMap;
