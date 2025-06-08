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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Assignment as TaskIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { taskService, userService } from '../services/api';

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
    location: { name: '', latitude: '', longitude: '' },
    fileNumber: '',
    timeLimit: '',
    keywords: '',
    assignedTo: ''
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

  // Abrir formulario para crear tarea
  const handleOpenCreateDialog = () => {
    setTaskForm({
      title: '',
      description: '',
      location: { name: '', latitude: '', longitude: '' },
      fileNumber: '',
      timeLimit: '',
      keywords: '',
      assignedTo: ''
    });
    setEditMode(false);
    setOpenDialog(true);
  };

  // Abrir formulario para editar tarea
  const handleOpenEditDialog = (task) => {
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      location: task.location || { name: '', latitude: '', longitude: '' },
      fileNumber: task.fileNumber || '',
      timeLimit: task.timeLimit || '',
      keywords: Array.isArray(task.keywords) ? task.keywords.join(', ') : task.keywords || '',
      assignedTo: task.assignedTo?._id || task.assignedTo || ''
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
      setTaskForm({
        ...taskForm,
        location: {
          ...taskForm.location,
          [locationField]: value
        }
      });
    } else {
      setTaskForm({
        ...taskForm,
        [name]: value
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

      // Preparar datos de la tarea
      const taskData = {
        ...taskForm,
        keywords: taskForm.keywords ? taskForm.keywords.split(',').map(k => k.trim()) : [],
        timeLimit: taskForm.timeLimit ? parseInt(taskForm.timeLimit, 10) : undefined
      };

      if (editMode) {
        await taskService.update(currentTaskId, taskData);
        showSnackbar('Tarea actualizada correctamente');
      } else {
        await taskService.create(taskData);
        showSnackbar('Tarea creada correctamente');
      }
      
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      showSnackbar(error.response?.data?.message || 'Error al guardar la tarea', 'error');
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
                        {task.assignedTo ? 
                          (typeof task.assignedTo === 'object' ? 
                            task.assignedTo.username : 
                            users.find(u => u._id === task.assignedTo)?.username || 'Usuario no encontrado'
                          ) : 
                          'Sin asignar'
                        }
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
        <DialogTitle>
          {editMode ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        </DialogTitle>
        <DialogContent>
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
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Ubicación
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre de ubicación"
                name="location.name"
                value={taskForm.location?.name || ''}
                onChange={handleFormChange}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Latitud"
                name="location.latitude"
                type="number"
                value={taskForm.location?.latitude || ''}
                onChange={handleFormChange}
                margin="dense"
                inputProps={{ step: 'any' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Longitud"
                name="location.longitude"
                type="number"
                value={taskForm.location?.longitude || ''}
                onChange={handleFormChange}
                margin="dense"
                inputProps={{ step: 'any' }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Asignar a</InputLabel>
                <Select
                  name="assignedTo"
                  value={taskForm.assignedTo}
                  onChange={handleFormChange}
                  label="Asignar a"
                >
                  <MenuItem value="">
                    <em>Sin asignar</em>
                  </MenuItem>
                  {users.filter(user => user.isActive).map(user => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmitTask} 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Guardar
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
