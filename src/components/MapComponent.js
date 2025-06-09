import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Componente marcador mejorado con opción de destacado
const Marker = ({ text, isSelected }) => {
  // Estilo destacado para el usuario seleccionado
  const markerSize = isSelected ? 48 : 36;
  const markerColor = isSelected ? '#FF5252' : '#f5f5dc'; // Rojo destacado o beige normal
  const fontWeight = isSelected ? 'bold' : 'normal';
  const fontSize = isSelected ? '14px' : '12px';
  const textColor = isSelected ? '#FFFFFF' : '#f5f5dc';
  
  // Agregar animación de rebote para el marcador seleccionado
  const animation = isSelected ? {
    animation: 'bounce 1.5s infinite',
    '@keyframes bounce': {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' }
    }
  } : {};
  
  return (
    <div 
      style={{
        position: 'absolute',
        transform: 'translate(-50%, -100%)',
        zIndex: isSelected ? 1000 : 1, // Mayor z-index para mostrar por encima
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...animation
      }}
    >
      <LocationOnIcon 
        sx={{ 
          color: markerColor, 
          fontSize: markerSize,
          filter: isSelected ? 'drop-shadow(0 0 5px rgba(255,255,255,0.7))' : 'none', // Resplandor para el marcador seleccionado
        }} 
      />
      {text && (
        <div style={{ 
          color: textColor, 
          fontWeight: fontWeight,
          fontSize: fontSize,
          backgroundColor: isSelected ? 'rgba(0,0,0,0.7)' : 'transparent',
          padding: isSelected ? '2px 6px' : '0',
          borderRadius: '4px',
          marginTop: '-5px'
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

const MapComponent = ({ center, zoom, markers = [], selectedUserId }) => {
  const theme = useTheme();
  // Usar useState para manejar la clave de API y el centro del mapa
  const [apiKey, setApiKey] = useState('');
  // Estado para manejar el centro del mapa
  const [mapCenter, setMapCenter] = useState(center || { lat: -34.61315, lng: -58.37723 });
  const [mapInstance, setMapInstance] = useState(null);
  const [mapsApi, setMapsApi] = useState(null);
  
  // Actualizar el centro cuando cambia el prop
  useEffect(() => {
    if (center) {
      setMapCenter(center);
      
      // Si ya existe una instancia del mapa, centrarla
      if (mapInstance && mapsApi) {
        mapInstance.panTo(center);
        console.log('Mapa centrado en:', center);
      }
    }
  }, [center, mapInstance, mapsApi]);
  
  // Cargar la clave API al montar el componente
  useEffect(() => {
    // Obtener la clave desde las variables de entorno
    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    // Debug para ver si la clave está definida
    console.log("Google Maps API Key status:", key ? "Defined" : "Undefined");
    
    // Si la clave está definida, la establecemos en el state
    if (key) {
      setApiKey(key);
    } else {
      console.error("Google Maps API Key not found in environment variables");
    }
  }, []);

  const defaultProps = {
    center: mapCenter, // Usamos el estado local
    zoom: zoom || 11
  };

  // Estilo personalizado para el mapa - Tema claro con tonos crema
  const mapStyles = [
    { 
      featureType: 'all', 
      elementType: 'all',
      stylers: [{ saturation: -20 }, { lightness: 20 }] 
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9e6ff' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#e8d5b7' }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5dc' }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#dfd2ae' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }]
    },
    {
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6d4c41' }]
    }
  ];

  return (
    <Paper sx={{ 
      height: '700px', // Tamaño fijo de 700px de alto
      width: '700px', // Tamaño fijo de 700px de ancho
      maxWidth: '100%', // Para ser responsivo en pantallas pequeñas
      margin: '0 auto', // Centrar horizontalmente
      border: `1px solid ${theme.palette.secondary.main}`,
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          padding: 2,
          color: theme.palette.secondary.main,
          borderBottom: `1px solid ${theme.palette.secondary.main}`,
          backgroundColor: 'rgba(32, 32, 32, 0.7)',
        }}
      >
        Mapa de Ubicaciones
      </Typography>
      <Box sx={{ height: 'calc(100% - 60px)', width: '100%' }}>
        {apiKey ? (
          <GoogleMapReact
            bootstrapURLKeys={{ key: apiKey }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
            options={{
              styles: mapStyles,
              fullscreenControl: false,
            }}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => {
              console.log("Google Maps API loaded successfully");
              setMapInstance(map);
              setMapsApi(maps);
            }}
            onError={(error) => {
              console.error("Google Maps API error:", error);
            }}
          >
            {markers.map((marker, idx) => (
              <Marker
                key={idx}
                lat={marker.lat}
                lng={marker.lng}
                text={marker.title}
                isSelected={marker.userId === selectedUserId}
              />
            ))}
          </GoogleMapReact>
        ) : (
          <Box sx={{ 
            p: 2, 
            color: theme.palette.secondary.main, 
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
    </Paper>
  );
};

export default MapComponent;
