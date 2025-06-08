import { createTheme } from '@mui/material/styles';

// Colores principales de ManageTime
const darkColor = '#2e2e2e'; // Negro/gris oscuro (fondo general)
const creamColor = '#fff3e5'; // Color crema
const modalColor = '#333333'; // Color gris oscuro para tarjetas y modales
const cardBorderRadius = '12px'; // Radio de borde para tarjetas

// Definimos un tema que coincida con los colores de la aplicación móvil
let theme = createTheme({
  palette: {
    primary: {
      main: darkColor,
      light: '#545454',
      dark: '#1a1a1a',
      contrastText: creamColor,
    },
    secondary: {
      main: creamColor,
      light: '#ffffff',
      dark: '#ccc0b3',
      contrastText: darkColor,
    },
    background: {
      default: darkColor, // Fondo negro como en la app móvil
      paper: modalColor, // Tarjetas y modales en gris oscuro
    },
    text: {
      primary: creamColor, // Texto principal en crema para fondos oscuros
      secondary: '#cccccc', // Texto secundario en gris claro
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

// Personalización de componentes específicos
theme = createTheme(theme, {
  components: {
    // Personalización de tarjetas como en la app móvil
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: modalColor,
          color: creamColor,
          borderRadius: cardBorderRadius,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          margin: '8px 0',
        }
      }
    },
    // Personalización de Paper (contenedores)
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: modalColor,
          color: creamColor,
          borderRadius: cardBorderRadius,
        }
      }
    },
    // Personalización del menú
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: modalColor,
          color: creamColor,
        }
      }
    },
    // Personalización de los modales
    MuiModal: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            backgroundColor: modalColor,
          }
        }
      }
    },
    // Personalización de los diálogos
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: modalColor,
          color: creamColor,
        }
      }
    },
    // Personalización de los popovers
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: modalColor,
          color: creamColor,
        }
      }
    },
    // Personalización de los elementos de texto dentro de fondos oscuros
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: creamColor,
          '&:hover': {
            backgroundColor: '#3e3e3e',
          },
        }
      }
    },
    // Personalización de botones
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'none',
          padding: '8px 16px',
          fontWeight: 500,
        },
        // Botón primario (oscuro)
        containedPrimary: {
          backgroundColor: modalColor,
          color: creamColor,
          '&:hover': {
            backgroundColor: '#444444',
          },
        },
        // Botón secundario (crema)
        containedSecondary: {
          backgroundColor: creamColor,
          color: darkColor,
          '&:hover': {
            backgroundColor: '#e6dac8',
          },
        },
      }
    },
    // Personalización de dividers
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#444444',
        }
      }
    }
  }
});

export default theme;
