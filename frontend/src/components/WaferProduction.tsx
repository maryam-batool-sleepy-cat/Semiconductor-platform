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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  LinearProgress,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Timeline,
  History,
  QrCodeScanner,
  PlayArrow,
  CheckCircle,
} from '@mui/icons-material';
import Navigation from './Navigation';
import { waferService } from '../services/api';

const WaferProduction: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [newBatch, setNewBatch] = useState({
    batch_name: '',
    product_type: 'AI-Accelerator',
    total_wafers: 25,
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await waferService.getBatches();
      setBatches(response.data.batches || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setLoading(false);
    }
  };

  const handleCreateBatch = async () => {
    if (!newBatch.batch_name.trim()) {
      setSnackbar({ open: true, message: 'Please enter a batch name', severity: 'error' });
      return;
    }
    
    try {
      await waferService.createBatch(newBatch);
      setSnackbar({ open: true, message: '✅ Batch created successfully!', severity: 'success' });
      setOpenDialog(false);
      setNewBatch({ batch_name: '', product_type: 'AI-Accelerator', total_wafers: 25 });
      fetchBatches();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to create batch';
      setSnackbar({ open: true, message: `❌ ${errorMsg}`, severity: 'error' });
    }
  };

  const handleViewHistory = async (batch: any) => {
    try {
      const response = await waferService.getBatchHistory(batch.id);
      setSelectedBatch(response.data);
      setShowHistory(true);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load batch history', severity: 'error' });
    }
  };

  const handleUpdateStage = async (waferId: string, stage: string) => {
    try {
      await waferService.updateWaferStage(waferId, stage);
      setSnackbar({ open: true, message: `✅ Wafer moved to ${stage}`, severity: 'success' });
      if (selectedBatch) {
        const response = await waferService.getBatchHistory(selectedBatch.batch.id);
        setSelectedBatch(response.data);
      }
      fetchBatches();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update stage', severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      completed: 'success',
      in_production: 'warning',
      registered: 'info',
      rejected: 'error',
      lithography: 'primary',
      etching: 'secondary',
      deposition: 'default',
      inspection: 'info',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => status.replace('_', ' ').toUpperCase();

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                📊 Wafer Production Management
              </Typography>
              <Typography variant="body1" sx={{ color: '#aaaaaa', mt: 1 }}>
                Register wafer batches, track movement, monitor fabrication progress, and record production history.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                bgcolor: '#00ff88',
                color: '#000000',
                '&:hover': { bgcolor: '#00cc66' },
                height: 48,
                mt: { xs: 2, sm: 0 },
              }}
            >
              New Batch
            </Button>
          </Box>
        </Paper>

        {/* Feature Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: 'Register Batches', icon: <AddIcon />, desc: 'Create new wafer batches with unique identifiers', color: '#00ff88' },
            { title: 'Track Movement', icon: <QrCodeScanner />, desc: 'Monitor wafer location through production stages', color: '#00cc66' },
            { title: 'Record Stages', icon: <Timeline />, desc: 'Track lithography, etching, deposition, inspection', color: '#33ff99' },
            { title: 'Production History', icon: <History />, desc: 'View complete history with timestamps', color: '#66ffbb' },
          ].map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card sx={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${feature.color}20`, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ color: feature.color }}>{feature.icon}</Box>
                    <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#888' }}>{feature.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Batches Table */}
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#00ff88' }}>📋 Wafer Batches</Typography>
            <IconButton onClick={fetchBatches} sx={{ color: '#888' }}><RefreshIcon /></IconButton>
          </Box>
          
          {loading ? (
            <Box sx={{ py: 4 }}><LinearProgress sx={{ bgcolor: 'rgba(0,255,136,0.1)' }} /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#888', fontWeight: 600 }}>Batch Name</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600 }}>Product Type</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600 }}>Wafers</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600 }}>Created</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batches.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ color: '#888', py: 4 }}>No batches found</TableCell></TableRow>
                  ) : (
                    batches.map((batch: any) => (
                      <TableRow key={batch.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{batch.batch_name}</TableCell>
                        <TableCell sx={{ color: '#aaa' }}>{batch.product_type}</TableCell>
                        <TableCell sx={{ color: '#aaa' }}>{batch.total_wafers}</TableCell>
                        <TableCell><Chip label={getStatusLabel(batch.status)} size="small" color={getStatusColor(batch.status)} /></TableCell>
                        <TableCell sx={{ color: '#888' }}>{new Date(batch.created_at).toLocaleDateString()}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="View History">
                            <IconButton size="small" onClick={() => handleViewHistory(batch)} sx={{ color: '#00ff88' }}>
                              <History />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Create Batch Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogTitle sx={{ color: '#00ff88' }}>Create New Wafer Batch</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Batch Name"
            fullWidth
            value={newBatch.batch_name}
            onChange={(e) => setNewBatch({ ...newBatch, batch_name: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#888' }, mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Product Type"
            fullWidth
            value={newBatch.product_type}
            onChange={(e) => setNewBatch({ ...newBatch, product_type: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#888' }, mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Total Wafers (20-30)"
            type="number"
            fullWidth
            value={newBatch.total_wafers}
            onChange={(e) => setNewBatch({ ...newBatch, total_wafers: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 20, max: 30 }}
            sx={{ input: { color: '#fff' }, label: { color: '#888' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={handleCreateBatch} sx={{ color: '#000000', bgcolor: '#00ff88', '&:hover': { bgcolor: '#00cc66' } }}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Production History Dialog */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogTitle sx={{ color: '#00ff88' }}>Production History: {selectedBatch?.batch?.batch_name}</DialogTitle>
        <DialogContent>
          {selectedBatch && (
            <Box>
              <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
                <Box><Typography color="#888" variant="caption">Product Type</Typography><Typography color="#fff">{selectedBatch.batch.product_type}</Typography></Box>
                <Box><Typography color="#888" variant="caption">Total Wafers</Typography><Typography color="#fff">{selectedBatch.batch.total_wafers}</Typography></Box>
                <Box><Typography color="#888" variant="caption">Completed</Typography><Typography color="#00ff88">{selectedBatch.completed}/{selectedBatch.total_wafers}</Typography></Box>
                <Box><Typography color="#888" variant="caption">Status</Typography><Chip label={getStatusLabel(selectedBatch.batch.status)} size="small" color={getStatusColor(selectedBatch.batch.status)} /></Box>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />
              <Typography variant="subtitle2" sx={{ color: '#00ff88', mb: 2 }}>Wafer Details</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#888' }}>Wafer ID</TableCell>
                      <TableCell sx={{ color: '#888' }}>Position</TableCell>
                      <TableCell sx={{ color: '#888' }}>Stage</TableCell>
                      <TableCell sx={{ color: '#888' }}>Updated</TableCell>
                      <TableCell sx={{ color: '#888' }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBatch.wafers?.map((wafer: any) => (
                      <TableRow key={wafer.id}>
                        <TableCell sx={{ color: '#fff' }}>{wafer.wafer_id}</TableCell>
                        <TableCell sx={{ color: '#aaa' }}>{wafer.position}</TableCell>
                        <TableCell><Chip label={getStatusLabel(wafer.current_stage)} size="small" color={getStatusColor(wafer.current_stage)} /></TableCell>
                        <TableCell sx={{ color: '#888', fontSize: '12px' }}>{new Date(wafer.updated_at).toLocaleString()}</TableCell>
                        <TableCell align="center">
                          {wafer.current_stage !== 'completed' && wafer.current_stage !== 'rejected' && (
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              {['lithography', 'etching', 'deposition', 'inspection'].map((stage) => (
                                <Tooltip key={stage} title={`Move to ${stage}`}>
                                  <IconButton size="small" onClick={() => handleUpdateStage(wafer.wafer_id, stage)} sx={{ color: '#00ff88' }}>
                                    <PlayArrow fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ))}
                            </Box>
                          )}
                          {wafer.current_stage === 'completed' && <CheckCircle sx={{ color: '#00ff88' }} />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setShowHistory(false)} sx={{ color: '#888' }}>Close</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default WaferProduction;
