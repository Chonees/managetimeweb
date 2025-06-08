import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Assignment as TaskIcon,
  BarChart as ReportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

export const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Usuarios', icon: <PeopleIcon />, path: '/users' },
  { text: 'Tareas', icon: <TaskIcon />, path: '/tasks' },
  { text: 'Ubicaciones', icon: <LocationIcon />, path: '/locations' },
];

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Cerrar drawer en pantallas pequeñas automáticamente
  React.useEffect(() => {
    setOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isSmallScreen) setOpen(false);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  // Estilizar los iconos para que sean color crema
const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: theme.palette.secondary.main, // Color crema
  minWidth: 40,
}));

// Estilizar los botones de la lista para que tengan un hover más visible
const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#3e3e3e',
    '& .MuiListItemIcon-root': {
      color: '#ffffff',
    },
    '& .MuiListItemText-primary': {
      color: '#ffffff',
    },
  },
  borderRadius: '8px',
  margin: '4px 8px',
  padding: '8px 16px',
}));

const drawer = (
    <>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
          ManageTime Admin
        </Typography>
      </Toolbar>
      <Divider sx={{ backgroundColor: 'rgba(255, 243, 229, 0.2)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledListItemButton onClick={() => handleNavigate(item.path)}>
              <StyledListItemIcon>{item.icon}</StyledListItemIcon>
              <ListItemText primary={item.text} sx={{ color: theme.palette.secondary.main }} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              color: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: 'rgba(255, 243, 229, 0.1)',
              } 
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Panel de Administración
          </Typography>
          {currentUser && (
            <div>
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, color: theme.palette.secondary.contrastText }}>
                  {currentUser.username?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  {currentUser.username || 'Admin'}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isSmallScreen ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.primary.main,
            borderRight: '1px solid rgba(255, 243, 229, 0.12)',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          mt: '64px',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
