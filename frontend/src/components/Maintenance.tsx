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
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Refresh,
  Warning as WarningIcon,
  Build,
  CheckCircle,
  Schedule,
  Add as AddIcon,
} from '@mui/icons-material';
import Navigation from './Navigation';
import { maintenanceService, equipmentService } from '../services/api';

const Maintenance: React.FC = () => {
  const [predictions, setPredictions] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
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
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [predictionsRes, alertsRes, equipmentRes] = await Promise.all([
        maintenanceService.getPredictions(),
        maintenanceService.getAlerts(),
        equipmentService.getEquipment(),
      ]);
      setPredictions(predictionsRes.data);
      setAlerts(alertsRes.data);
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

  if (loading || !predictions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000' }}>
        <Typography color="#ffaa33">Loading maintenance data...</Typography>
      </Box>
    );
  }

  const kpiData = [
    { label: 'Total Predictions', value: predictions.total_predictions || 0, color: '#ffaa33' },
    { label: 'High Priority', value: predictions.high_priority || 0, color: '#ff6b6b' },
    { label: 'Alerts Generated', value: alerts?.count || 0, color: '#ff6b6b' },
    { label: 'Equipment Active', value: equipment.filter(e => e.status === 'operational').length || 0, color: '#00ff88' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
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
                  <Typography color="#888" gutterBottom>{kpi.label}</Typography>
                  <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 'bold' }}>{kpi.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Predictions Table */}
        <Paper sx={{ p: 3, mb: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#ffaa33', mb: 2 }}>🔮 Maintenance Predictions</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#888' }}>Equipment</TableCell>
                  <TableCell sx={{ color: '#888' }}>Operating Hours</TableCell>
                  <TableCell sx={{ color: '#888' }}>Priority</TableCell>
                  <TableCell sx={{ color: '#888' }}>Days Until</TableCell>
                  <TableCell sx={{ color: '#888' }}>Recommended Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {predictions.predictions?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} sx={{ color: '#888', textAlign: 'center', py: 4 }}>No predictions available</TableCell></TableRow>
                ) : (
                  predictions.predictions?.map((p: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#fff' }}>{p.name}</TableCell>
                      <TableCell sx={{ color: '#aaa' }}>{p.current_operating_hours}</TableCell>
                      <TableCell><Chip label={p.priority} size="small" color={p.priority === 'high' ? 'error' : 'warning'} /></TableCell>
                      <TableCell sx={{ color: '#aaa' }}>{p.days_until_maintenance}</TableCell>
                      <TableCell sx={{ color: p.priority === 'high' ? '#ff6b6b' : '#ffaa33' }}>{p.recommended_action}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Alerts */}
        {alerts?.alerts?.length > 0 && (
          <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,107,107,0.2)' }}>
            <Typography variant="h6" sx={{ color: '#ff6b6b', mb: 2 }}>🚨 Active Alerts</Typography>
            {alerts.alerts.map((alert: any, index: number) => (
              <Alert key={index} severity="error" sx={{ mb: 1, bgcolor: 'rgba(255,0,0,0.05)' }}>
                {alert.message}
              </Alert>
            ))}
          </Paper>
        )}
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

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Maintenance;
