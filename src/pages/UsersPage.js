import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UsersPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    isAdmin: false
  });
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar la lista de usuarios
  const fetchUsers = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setError('No autenticado');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAll();
      setUsers(response.data);
      // Resetear contador de reintentos al tener éxito
      setRetryCount(0);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      
      // Incrementar contador de reintentos
      setRetryCount(prev => prev + 1);
      
      // Preparar mensaje de error detallado
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || 'Error desconocido'}`
        : 'Error de conexión con el servidor';
      
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar usuarios si el usuario está autenticado
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Evitar reintentos infinitos
  useEffect(() => {
    if (retryCount > 0 && retryCount < 3 && error) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          console.log(`Reintento #${retryCount} de carga de usuarios...`);
          fetchUsers();
        }
      }, 5000); // Esperar 5 segundos entre reintentos
      return () => clearTimeout(timer);
    }
  }, [retryCount, error, isAuthenticated]);

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

  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Abrir formulario para crear usuario
  const handleOpenCreateDialog = () => {
    setUserForm({
      username: '',
      email: '',
      password: '',
      isAdmin: false
    });
    setEditMode(false);
    setOpenDialog(true);
  };

  // Abrir formulario para editar usuario
  const handleOpenEditDialog = (user) => {
    setUserForm({
      username: user.username,
      email: user.email,
      password: '',
      isAdmin: user.isAdmin
    });
    setCurrentUserId(user._id);
    setEditMode(true);
    setOpenDialog(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setUserForm({
      ...userForm,
      [name]: name === 'isAdmin' ? checked : value
    });
  };

  // Crear o actualizar usuario
  const handleSubmitUser = async () => {
    try {
      if (!userForm.username || !userForm.email || (!editMode && !userForm.password)) {
        showSnackbar('Por favor completa todos los campos requeridos', 'error');
        return;
      }

      if (editMode) {
        // Si estamos en modo edición y la contraseña está vacía, la eliminamos del objeto
        const userData = { ...userForm };
        if (!userData.password) delete userData.password;
        
        await userService.update(currentUserId, userData);
        showSnackbar('Usuario actualizado correctamente');
      } else {
        await userService.create(userForm);
        showSnackbar('Usuario creado correctamente');
      }
      
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      showSnackbar(error.response?.data?.message || 'Error al guardar usuario', 'error');
    }
  };

  // Cambiar estado de usuario (activo/inactivo)
  const handleToggleUserStatus = async (userId, currentIsActive) => {
    try {
      // Invertimos el estado actual para activar/desactivar
      const newIsActive = !currentIsActive;
      console.log(`Cambiando estado de usuario ${userId} a: ${newIsActive ? 'Activo' : 'Inactivo'}`);
      
      await userService.toggleActive(userId, newIsActive);
      fetchUsers();
      showSnackbar(`Usuario ${newIsActive ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      showSnackbar('Error al actualizar estado del usuario', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Usuarios
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            sx={{ mr: 2 }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Box>

      {/* Tabla de usuarios */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre de usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Alert severity="error" sx={{ my: 2 }}>
                      {error}
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={fetchUsers} 
                        sx={{ ml: 2 }}
                      >
                        Reintentar
                      </Button>
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.isAdmin ? 'Administrador' : 'Usuario'}
                          color={user.isAdmin ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Activo' : 'Inactivo'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar usuario">
                          <IconButton
                            aria-label="editar"
                            onClick={() => handleOpenEditDialog(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}>
                          <IconButton
                            aria-label={user.isActive ? 'desactivar' : 'activar'}
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                            color={user.isActive ? 'error' : 'success'}
                          >
                            {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Modal para crear/editar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {editMode
              ? 'Modifica la información del usuario. Deja la contraseña en blanco si no deseas cambiarla.'
              : 'Completa el formulario para crear un nuevo usuario.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Nombre de usuario"
            fullWidth
            variant="outlined"
            value={userForm.username}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={userForm.email}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label={editMode ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={userForm.password}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={userForm.isAdmin}
                onChange={handleFormChange}
                name="isAdmin"
                color="primary"
              />
            }
            label="Es administrador"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmitUser} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

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

export default UsersPage;
