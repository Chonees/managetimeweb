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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Assignment as TaskIcon,
  Save as SaveIcon,
  MyLocation as LocationIcon
} from '@mui/icons-material';
import { taskService, userService } from '../services/api';
import TaskPerimeterMap from '../components/TaskPerimeterMap';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    location: { 
      name: '', 
      latitude: '', 
      longitude: '', 
      type: 'Point',
      coordinates: [0, 0]
    },
    radius: 1.0, // Radio de perímetro en km (valor por defecto)
    fileNumber: '',
    timeLimit: '',
    keywords: '',
    handsFreeMode: false, // Modo manos libres
    userIds: [] // Múltiples usuarios (nuevo modelo)
  });
  const [editMode, setEditMode] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar la lista de tareas y usuarios
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, usersResponse] = await Promise.all([
        taskService.getAll(),
        userService.getAll()
      ]);
      setTasks(tasksResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      showSnackbar('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // Abrir diálogo para crear tarea
  const handleOpenCreateDialog = () => {
    // Intentar obtener la ubicación actual
    let initialLocation = {
      latitude: '',
      longitude: '',
      name: '',
      coordinates: []
    };
    
    // Iniciar con ubicación por defecto (centro de Buenos Aires)
    setTaskForm({
      title: '',
      description: '',
      location: {
        latitude: -34.61315,
        longitude: -58.37723,
        name: 'Buenos Aires, Argentina',
        coordinates: [-58.37723, -34.61315]
      },
      radius: 1.0,
      fileNumber: '',
      timeLimit: '',
      keywords: '',
      handsFreeMode: false,
      userIds: []
    });
    setEditMode(false);
    setCurrentTaskId(null);
    setOpenDialog(true);
  };

  // Abrir formulario para editar tarea
  const handleOpenEditDialog = (task) => {
    // Preparar la estructura de coordenadas
    let locationData = { name: '', latitude: '', longitude: '', type: 'Point', coordinates: [0, 0] };
    
    // Si hay ubicación en la tarea, usarla
    if (task.location) {
      if (task.location.coordinates && Array.isArray(task.location.coordinates)) {
        // Extraer coordenadas del formato del backend
        locationData = {
          ...task.location,
          latitude: task.location.coordinates[1] || 0, // En GeoJSON es [lng, lat]
          longitude: task.location.coordinates[0] || 0
        };
      } else if (task.location.latitude && task.location.longitude) {
        // Si viene en formato plano de latitud/longitud
        locationData = {
          name: task.location.name || '',
          latitude: task.location.latitude,
          longitude: task.location.longitude,
          type: 'Point',
          coordinates: [task.location.longitude, task.location.latitude]
        };
      }
      
      // Si hay nombre de ubicación
      if (task.locationName && !locationData.name) {
        locationData.name = task.locationName;
      }
    }
    
    // Preparar múltiples usuarios
    const userIds = [];
    if (task.userIds && Array.isArray(task.userIds)) {
      task.userIds.forEach(user => {
        if (typeof user === 'string') {
          userIds.push(user);
        } else if (user && user._id) {
          userIds.push(user._id);
        }
      });
    } else if (task.userId) {
      // Compatibilidad con modelo anterior
      const userId = typeof task.userId === 'object' ? task.userId._id : task.userId;
      if (userId && !userIds.includes(userId)) {
        userIds.push(userId);
      }
    }
    
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      location: locationData,
      radius: task.radius || 1.0,
      fileNumber: task.fileNumber || '',
      timeLimit: task.timeLimit || '',
      keywords: task.keywords || '',
      handsFreeMode: !!task.handsFreeMode,
      userIds: userIds
    });
    
    setCurrentTaskId(task._id);
    setEditMode(true);
    setOpenDialog(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      let updatedLocation = {
        ...taskForm.location,
        [locationField]: value
      };
      
      // Si cambian lat o lng, actualizar el array de coordenadas
      if (locationField === 'latitude' || locationField === 'longitude') {
        updatedLocation.coordinates = [
          locationField === 'longitude' ? parseFloat(value) || 0 : taskForm.location.longitude || 0,
          locationField === 'latitude' ? parseFloat(value) || 0 : taskForm.location.latitude || 0
        ];
      }
      
      setTaskForm({
        ...taskForm,
        location: updatedLocation
      });
    } else if (name === 'userIds') {
      // Manejar selección múltiple
      setTaskForm({
        ...taskForm,
        userIds: value
      });
    } else if (name === 'handsFreeMode') {
      // Manejar checkbox
      setTaskForm({
        ...taskForm,
        handsFreeMode: e.target.checked
      });
    } else {
      setTaskForm({
        ...taskForm,
        [name]: value
      });
    }
  };
  
  // Manejar cambios desde el mapa de perímetro
  const handlePerimeterChange = (changes) => {
    if (changes.radius) {
      setTaskForm({
        ...taskForm,
        radius: changes.radius
      });
    }
    
    if (changes.location) {
      setTaskForm({
        ...taskForm,
        location: {
          ...taskForm.location,
          ...changes.location
        }
      });
    }
  };

  // Abrir diálogo de confirmación para eliminar tarea
  const handleDeleteConfirm = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  // Eliminar tarea
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await taskService.delete(taskToDelete._id);
      showSnackbar('Tarea eliminada correctamente');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      showSnackbar('Error al eliminar la tarea', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  // Crear o actualizar tarea
  const handleSubmitTask = async () => {
    try {
      // Validación básica
      if (!taskForm.title || !taskForm.fileNumber) {
        showSnackbar('El título y el número de archivo son obligatorios', 'error');
        return;
      }
      
      // Verificar coordenadas
      if (!taskForm.location.latitude || !taskForm.location.longitude) {
        showSnackbar('Por favor ingrese coordenadas válidas', 'error');
        return;
      }
      
      // Preparar objeto para el backend
      const taskData = {
        ...taskForm,
        // Asegurar que la ubicación tenga el formato correcto para MongoDB
        location: {
          type: 'Point',
          coordinates: [parseFloat(taskForm.location.longitude), parseFloat(taskForm.location.latitude)]
        },
        locationName: taskForm.location.name,
        // Asegurar que el radio sea un número
        radius: parseFloat(taskForm.radius) || 1.0,
        // Asegurar que timeLimit sea un número
        timeLimit: taskForm.timeLimit ? parseInt(taskForm.timeLimit) : 0,
      };
      
      console.log('Datos a enviar:', taskData);

      if (editMode) {
        await taskService.update(currentTaskId, taskData);
        showSnackbar('Tarea actualizada exitosamente');
      } else {
        await taskService.create(taskData);
        showSnackbar('Tarea creada exitosamente');
      }

      handleCloseDialog();
      fetchData(); // Recargar lista de tareas
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      showSnackbar(`Error al guardar la tarea: ${error.response?.data?.message || error.message}`, 'error');
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Tareas
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ mr: 2 }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Nueva Tarea
          </Button>
        </Box>
      </Box>

      {/* Tabla de tareas */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Nº Archivo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Asignada a</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay tareas registradas
                  </TableCell>
                </TableRow>
              ) : (
                tasks
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((task) => (
                    <TableRow key={task._id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.fileNumber}</TableCell>
                      <TableCell>
                        <Chip
                          icon={task.completed ? <CheckCircleIcon /> : <PendingIcon />}
                          label={task.completed ? 'Completada' : 'Pendiente'}
                          color={task.completed ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {task.userIds && task.userIds.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {task.userIds.map(userId => {
                              // Manejar caso donde userId puede ser objeto o string
                              const id = typeof userId === 'object' ? userId._id : userId;
                              const user = users.find(u => u._id === id);
                              return (
                                <Chip 
                                  key={id} 
                                  label={user ? user.username : 'Usuario'} 
                                  size="small" 
                                  variant="outlined"
                                />
                              );
                            })}
                          </Box>
                        ) : task.userId ? (
                          // Compatibilidad con el modelo anterior
                          <Chip 
                            label={typeof task.userId === 'object' ? 
                              task.userId.username : 
                              users.find(u => u._id === task.userId)?.username || 'Usuario'} 
                            size="small" 
                            variant="outlined"
                          />
                        ) : (
                          <em>Sin asignar</em>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.location?.name || 'No especificada'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar tarea">
                          <IconButton
                            aria-label="editar"
                            onClick={() => handleOpenEditDialog(task)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar tarea">
                          <IconButton
                            aria-label="eliminar"
                            onClick={() => handleDeleteConfirm(task)}
                            color="error"
                          >
                            <DeleteIcon />
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
          count={tasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Modal para crear/editar tarea */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'background.dark', color: 'white', pb: 2 }}>
          {editMode ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#333333', color: 'white', p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Título"
                name="title"
                value={taskForm.title}
                onChange={handleFormChange}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Número de Archivo"
                name="fileNumber"
                value={taskForm.fileNumber}
                onChange={handleFormChange}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={taskForm.description}
                onChange={handleFormChange}
                margin="dense"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Palabras clave (separadas por comas)"
                name="keywords"
                value={taskForm.keywords}
                onChange={handleFormChange}
                margin="dense"
                placeholder="ej. urgente, inspección, etc."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Límite de tiempo (minutos)"
                name="timeLimit"
                type="number"
                value={taskForm.timeLimit}
                onChange={handleFormChange}
                margin="dense"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Asignar usuarios</InputLabel>
                <Select
                  name="userIds"
                  multiple
                  value={taskForm.userIds}
                  onChange={handleFormChange}
                  label="Asignar usuarios"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((userId) => {
                        const user = users.find(u => u._id === userId);
                        return (
                          <Chip key={userId} label={user ? user.username : userId} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  <MenuItem value="" disabled>
                    <em>Seleccione uno o más usuarios</em>
                  </MenuItem>
                  {users.filter(user => user.isActive).map(user => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    id="handsFreeMode"
                    name="handsFreeMode"
                    checked={taskForm.handsFreeMode}
                    onChange={handleFormChange}
                    color="primary"
                  />
                }
                label="Modo manos libres (activación por voz)"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ width: '100%', pt: 4, pb: 3 }}>
            <Typography variant="h6" sx={{ px: 2, mb: 2, color: 'white' }}>
              Perímetro de la Tarea
            </Typography>
            <TaskPerimeterMap 
              location={taskForm.location}
              radius={taskForm.radius}
              onChange={handlePerimeterChange}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#333333', justifyContent: 'flex-end', p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ color: 'white' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitTask}
            variant="contained"
            sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
            startIcon={<SaveIcon />}
          >
            {editMode ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar tarea */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar la tarea "{taskToDelete?.title}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained">
            Eliminar
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

export default TasksPage;
