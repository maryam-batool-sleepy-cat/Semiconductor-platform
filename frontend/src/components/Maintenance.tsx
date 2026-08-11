import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Build,
  CheckCircle,
  Schedule,
  Add as AddIcon,
  Refresh,
  History,
  TrendingUp,
  TrendingDown,
  Assessment,
} from '@mui/icons-material';
import Navigation from './Navigation';
import { maintenanceService, equipmentService } from '../services/api';

const Maintenance: React.FC = () => {
  const [predictions, setPredictions] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);
  const [predictionDialog, setPredictionDialog] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [newMaintenance, setNewMaintenance] = useState({
    equipment_id: 0,
    maintenance_type: 'Preventive',
    scheduled_date: '',
    description: '',
    technician: '',
    cost: 0,
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    // Check for alerts every 5 minutes
    const alertInterval = setInterval(() => {
      if (alerts && alerts.count > 0) {
        setAlertDialog(true);
      }
    }, 300000); // 5 minutes
    return () => {
      clearInterval(interval);
      clearInterval(alertInterval);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [predictionsRes, alertsRes, historyRes, equipmentRes] = await Promise.all([
        maintenanceService.getPredictions(),
        maintenanceService.getAlerts(),
        maintenanceService.getHistory(),
        equipmentService.getEquipment(),
      ]);
      setPredictions(predictionsRes.data);
      setAlerts(alertsRes.data);
      setHistory(historyRes.data);
      setEquipment(equipmentRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      setLoading(false);
    }
  };

  const handleScheduleMaintenance = async () => {
    try {
      await maintenanceService.scheduleMaintenance(newMaintenance);
      setSnackbar({ open: true, message: '✅ Maintenance scheduled successfully!', severity: 'success' });
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Failed to schedule maintenance', severity: 'error' });
    }
  };

  const handleCompleteMaintenance = async (maintenanceId: number) => {
    try {
      await maintenanceService.completeMaintenance(maintenanceId);
      setSnackbar({ open: true, message: '✅ Maintenance completed!', severity: 'success' });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Failed to complete maintenance', severity: 'error' });
    }
  };

  const handleViewPrediction = (prediction: any) => {
    setSelectedPrediction(prediction);
    setPredictionDialog(true);
  };

  if (loading || !predictions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000' }}>
        <Typography color="#ffaa33">Loading maintenance data...</Typography>
      </Box>
    );
  }

  const kpiData = [
    { label: 'Total Predictions', value: predictions.total_predictions || 0, color: '#ffaa33', icon: <Assessment /> },
    { label: 'Critical Priority', value: predictions.critical || 0, color: '#ff1744', icon: <WarningIcon /> },
    { label: 'High Priority', value: predictions.high || 0, color: '#ff9100', icon: <TrendingUp /> },
    { label: 'Alerts Generated', value: alerts?.count || 0, color: '#ff6b6b', icon: <Build /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(255,170,51,0.03)', border: '1px solid rgba(255,170,51,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#ffaa33', fontWeight: 'bold' }}>⚠️ Predictive Maintenance</Typography>
              <Typography variant="body1" sx={{ color: '#aaaaaa', mt: 1 }}>
                Analyse equipment operating hours, monitor health, predict maintenance schedules.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                bgcolor: '#ffaa33',
                color: '#000000',
                '&:hover': { bgcolor: '#ff9900' },
                mt: { xs: 2, sm: 0 },
              }}
            >
              Schedule Maintenance
            </Button>
          </Box>
        </Paper>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {kpiData.map((kpi) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.label}>
              <Card sx={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${kpi.color}20` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="#888" gutterBottom>{kpi.label}</Typography>
                      <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 'bold' }}>{kpi.value}</Typography>
                    </Box>
                    <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Two Column Layout */}
        <Grid container spacing={3}>
          {/* Left Column: Predictions & Alerts */}
          <Grid item xs={12} md={6}>
            {/* Predictions Table */}
            <Paper sx={{ p: 3, mb: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#ffaa33' }}>🔮 Maintenance Predictions</Typography>
                <IconButton onClick={fetchData} sx={{ color: '#888' }}><Refresh /></IconButton>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#888' }}>Equipment</TableCell>
                      <TableCell sx={{ color: '#888' }}>Hours</TableCell>
                      <TableCell sx={{ color: '#888' }}>Priority</TableCell>
                      <TableCell sx={{ color: '#888' }}>Days</TableCell>
                      <TableCell sx={{ color: '#888' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {predictions.predictions?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} sx={{ color: '#888', textAlign: 'center', py: 4 }}>No predictions available</TableCell></TableRow>
                    ) : (
                      predictions.predictions?.slice(0, 5).map((p: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell sx={{ color: '#fff' }}>{p.name}</TableCell>
                          <TableCell sx={{ color: '#aaa' }}>{p.current_operating_hours}</TableCell>
                          <TableCell>
                            <Chip 
                              label={p.priority} 
                              size="small" 
                              sx={{ 
                                bgcolor: p.priority_color + '30',
                                color: p.priority_color,
                                fontWeight: 'bold',
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#aaa' }}>{p.days_until_maintenance}</TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              onClick={() => handleViewPrediction(p)}
                              sx={{ color: '#ffaa33' }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Active Alerts */}
            {alerts?.alerts?.length > 0 && (
              <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,107,107,0.2)' }}>
                <Typography variant="h6" sx={{ color: '#ff6b6b', mb: 2 }}>🚨 Active Alerts</Typography>
                {alerts.alerts.map((alert: any, index: number) => (
                  <Alert 
                    key={index} 
                    severity={alert.severity === 'critical' ? 'error' : 'warning'} 
                    sx={{ mb: 1, bgcolor: 'rgba(255,0,0,0.05)' }}
                  >
                    {alert.message}
                  </Alert>
                ))}
              </Paper>
            )}
          </Grid>

          {/* Right Column: KPIs & History */}
          <Grid item xs={12} md={6}>
            {/* Maintenance KPIs */}
            <Paper sx={{ p: 3, mb: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ color: '#ffaa33', mb: 2 }}>📊 Maintenance KPIs</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,170,51,0.1)' }}>
                    <CardContent>
                      <Typography color="#888" variant="caption">Scheduled</Typography>
                      <Typography variant="h5" sx={{ color: '#ffaa33' }}>
                        {history.filter(h => h.status === 'scheduled').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,136,0.1)' }}>
                    <CardContent>
                      <Typography color="#888" variant="caption">Completed</Typography>
                      <Typography variant="h5" sx={{ color: '#00ff88' }}>
                        {history.filter(h => h.status === 'completed').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,107,107,0.1)' }}>
                    <CardContent>
                      <Typography color="#888" variant="caption">Overdue</Typography>
                      <Typography variant="h5" sx={{ color: '#ff6b6b' }}>
                        {history.filter(h => h.status === 'scheduled' && new Date(h.scheduled_date) < new Date()).length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(51,255,153,0.1)' }}>
                    <CardContent>
                      <Typography color="#888" variant="caption">Avg Cost</Typography>
                      <Typography variant="h5" sx={{ color: '#33ff99' }}>
                        ${history.length > 0 ? (history.reduce((sum, h) => sum + h.cost, 0) / history.length).toFixed(0) : 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Maintenance History */}
            <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ color: '#ffaa33', mb: 2 }}>📋 Maintenance History</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#888' }}>Equipment</TableCell>
                      <TableCell sx={{ color: '#888' }}>Type</TableCell>
                      <TableCell sx={{ color: '#888' }}>Status</TableCell>
                      <TableCell sx={{ color: '#888' }}>Date</TableCell>
                      <TableCell sx={{ color: '#888' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow><TableCell colSpan={5} sx={{ color: '#888', textAlign: 'center', py: 4 }}>No maintenance history</TableCell></TableRow>
                    ) : (
                      history.slice(0, 5).map((record: any) => {
                        const eq = equipment.find(e => e.id === record.equipment_id);
                        return (
                          <TableRow key={record.id}>
                            <TableCell sx={{ color: '#fff' }}>{eq?.name || 'N/A'}</TableCell>
                            <TableCell sx={{ color: '#aaa' }}>{record.maintenance_type}</TableCell>
                            <TableCell>
                              <Chip 
                                label={record.status} 
                                size="small" 
                                color={record.status === 'completed' ? 'success' : 'warning'} 
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#888' }}>
                              {new Date(record.scheduled_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {record.status === 'scheduled' && (
                                <Button 
                                  size="small" 
                                  onClick={() => handleCompleteMaintenance(record.id)}
                                  sx={{ color: '#00ff88' }}
                                >
                                  Complete
                                </Button>
                              )}
                              {record.status === 'completed' && (
                                <CheckCircle sx={{ color: '#00ff88', fontSize: 20 }} />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Schedule Maintenance Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogTitle sx={{ color: '#ffaa33' }}>Schedule Maintenance</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Equipment ID"
            type="number"
            fullWidth
            value={newMaintenance.equipment_id}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, equipment_id: parseInt(e.target.value) })}
            sx={{ input: { color: '#fff' }, label: { color: '#888' }, mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Maintenance Type"
            fullWidth
            value={newMaintenance.maintenance_type}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, maintenance_type: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#888' }, mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Scheduled Date"
            type="datetime-local"
            fullWidth
            value={newMaintenance.scheduled_date}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduled_date: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#888' }, mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={newMaintenance.description}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#888' }, mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Technician"
            fullWidth
            value={newMaintenance.technician}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, technician: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#888' }, mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Cost"
            type="number"
            fullWidth
            value={newMaintenance.cost}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) })}
            sx={{ input: { color: '#fff' }, label: { color: '#888' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={handleScheduleMaintenance} sx={{ color: '#000000', bgcolor: '#ffaa33', '&:hover': { bgcolor: '#ff9900' } }}>Schedule</Button>
        </DialogActions>
      </Dialog>

      {/* Prediction Details Dialog */}
      <Dialog open={predictionDialog} onClose={() => setPredictionDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogTitle sx={{ color: '#ffaa33' }}>🔮 Maintenance Prediction Details</DialogTitle>
        <DialogContent>
          {selectedPrediction && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#fff' }}>{selectedPrediction.name}</Typography>
                <Chip 
                  label={selectedPrediction.priority} 
                  sx={{ 
                    bgcolor: selectedPrediction.priority_color + '30',
                    color: selectedPrediction.priority_color,
                    fontWeight: 'bold',
                  }} 
                />
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemText primary="Equipment ID" secondary={selectedPrediction.equipment_id} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Type" secondary={selectedPrediction.type} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Operating Hours" secondary={`${selectedPrediction.current_operating_hours} hours`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Temperature" secondary={`${selectedPrediction.temperature}°C`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Vibration" secondary={`${selectedPrediction.vibration} mm/s`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Health Score" secondary={`${Math.round(selectedPrediction.health_score)}%`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Days Until Maintenance" secondary={`${selectedPrediction.days_until_maintenance} days`} />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Recommended Action" 
                    secondary={
                      <Typography sx={{ color: selectedPrediction.priority_color, fontWeight: 'bold' }}>
                        {selectedPrediction.recommended_action}
                      </Typography>
                    } 
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPredictionDialog(false)} sx={{ color: '#888' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Auto Alert Dialog */}
      <Dialog open={alertDialog} onClose={() => setAlertDialog(false)} PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(255,107,107,0.2)' } }}>
        <DialogTitle sx={{ color: '#ff6b6b' }}>🚨 Maintenance Alerts</DialogTitle>
        <DialogContent>
          {alerts?.alerts?.map((alert: any, index: number) => (
            <Alert 
              key={index} 
              severity={alert.severity === 'critical' ? 'error' : 'warning'} 
              sx={{ mb: 1, bgcolor: 'rgba(255,0,0,0.05)' }}
            >
              {alert.message}
            </Alert>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialog(false)} sx={{ color: '#888' }}>Dismiss</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Maintenance;
