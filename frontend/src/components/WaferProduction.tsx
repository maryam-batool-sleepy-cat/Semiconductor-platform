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
  Tooltip,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  History,
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
  const [activeTab, setActiveTab] = useState(0);
  const [productionProgress, setProductionProgress] = useState<any>(null);
  const [newBatch, setNewBatch] = useState({
    batch_name: '',
    product_type: 'AI-Accelerator',
    total_wafers: 25,
  });

  const stages = ['registered', 'lithography', 'etching', 'deposition', 'inspection', 'completed'];
  const stageLabels = ['Registered', 'Lithography', 'Etching', 'Deposition', 'Inspection', 'Completed'];

  useEffect(() => {
    fetchBatches();
    const interval = setInterval(fetchBatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await waferService.getBatches();
      setBatches(response.data.batches || []);
      const total = response.data.batches?.length || 0;
      const completed = response.data.batches?.filter((b: any) => b.status === 'completed').length || 0;
      setProductionProgress({ total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 });
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
  const getStageStep = (stage: string) => stages.indexOf(stage);
  const isStageComplete = (currentStage: string, stageIndex: number) => getStageStep(currentStage) >= stageIndex;

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Page Header */}
        <Paper sx={{ p: 3, mb: 3, background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                📊 Wafer Production Management
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaaaaa', mt: 1 }}>
                Register wafer batches, track movement, record production stages, monitor fabrication progress.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  bgcolor: '#00ff88',
                  color: '#000000',
                  '&:hover': { bgcolor: '#00cc66' },
                }}
              >
                New Batch
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Tab label="📋 Batches" />
          <Tab label="🔍 Track Wafer Movement" />
          <Tab label="📈 Fabrication Progress" />
          <Tab label="⏱️ Production Timestamps" />
        </Tabs>

        {/* Tab 1: Batches */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#00ff88' }}>📋 Wafer Batches</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="#888">
                  Total: {batches.length} | Completed: {batches.filter(b => b.status === 'completed').length}
                </Typography>
                <IconButton onClick={fetchBatches} sx={{ color: '#888' }}><RefreshIcon /></IconButton>
              </Box>
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
        )}

        {/* Tab 2: Track Wafer Movement */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ color: '#00cc66', mb: 2 }}>🔍 Track Wafer Movement</Typography>
            <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>Monitor wafer location and movement through production stages.</Typography>
            <Grid container spacing={2}>
              {batches.filter(b => b.status !== 'completed').slice(0, 5).map((batch) => (
                <Grid item xs={12} key={batch.id}>
                  <Card sx={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,204,102,0.1)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{batch.batch_name}</Typography>
                        <Chip label={batch.status} size="small" color={getStatusColor(batch.status)} />
                      </Box>
                      <Stepper activeStep={getStageStep(batch.status)} orientation="horizontal" sx={{ mt: 1 }}>
                        {stageLabels.map((label, index) => (
                          <Step key={index} completed={isStageComplete(batch.status, index)}>
                            <StepLabel StepIconComponent={() => (
                              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: isStageComplete(batch.status, index) ? '#00ff88' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isStageComplete(batch.status, index) ? '#000' : '#888', fontSize: 12 }}>
                                {isStageComplete(batch.status, index) ? '✓' : index + 1}
                              </Box>
                            )}>
                              <Typography variant="caption" sx={{ color: isStageComplete(batch.status, index) ? '#00ff88' : '#888', fontSize: 10 }}>
                                {label}
                              </Typography>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="#888">Current Stage: {getStatusLabel(batch.status)}</Typography>
                        <Typography variant="caption" color="#888">Progress: {Math.round((getStageStep(batch.status) / 5) * 100)}%</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {batches.filter(b => b.status !== 'completed').length === 0 && (
                <Typography sx={{ color: '#888', textAlign: 'center', width: '100%', py: 4 }}>No active wafers in production</Typography>
              )}
            </Grid>
          </Paper>
        )}

        {/* Tab 3: Fabrication Progress */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ color: '#33ff99', mb: 2 }}>📈 Fabrication Progress</Typography>
            <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>Real-time monitoring of wafer fabrication progress.</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(51,255,153,0.1)' }}>
                  <CardContent>
                    <Typography color="#888" gutterBottom>Overall Progress</Typography>
                    <Typography variant="h3" sx={{ color: '#33ff99', fontWeight: 'bold' }}>
                      {productionProgress ? Math.round(productionProgress.percentage) : 0}%
                    </Typography>
                    <LinearProgress variant="determinate" value={productionProgress ? productionProgress.percentage : 0} sx={{ mt: 1, bgcolor: 'rgba(51,255,153,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#33ff99' } }} />
                    <Typography variant="body2" color="#888" sx={{ mt: 1 }}>
                      {productionProgress ? `${productionProgress.completed} / ${productionProgress.total} batches completed` : 'No data'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  {batches.slice(0, 6).map((batch) => (
                    <Grid item xs={12} sm={6} key={batch.id}>
                      <Card sx={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(51,255,153,0.05)' }}>
                        <CardContent>
                          <Typography variant="body2" sx={{ color: '#fff' }}>{batch.batch_name}</Typography>
                          <Typography variant="caption" color="#888">Wafer #{batch.id}</Typography>
                          <LinearProgress variant="determinate" value={Math.round((getStageStep(batch.status) / 5) * 100)} sx={{ mt: 1, bgcolor: 'rgba(51,255,153,0.1)', '& .MuiLinearProgress-bar': { bgcolor: batch.status === 'completed' ? '#00ff88' : '#33ff99' } }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="#888">Stage {getStageStep(batch.status) + 1}/6</Typography>
                            <Chip label={getStatusLabel(batch.status)} size="small" color={getStatusColor(batch.status)} sx={{ height: 20, fontSize: 10 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Tab 4: Production Timestamps */}
        {activeTab === 3 && (
          <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ color: '#66ffbb', mb: 2 }}>⏱️ Production Timestamps</Typography>
            <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>Record production timestamps for each wafer stage.</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#888' }}>Batch</TableCell>
                    <TableCell sx={{ color: '#888' }}>Current Stage</TableCell>
                    <TableCell sx={{ color: '#888' }}>Stage Start</TableCell>
                    <TableCell sx={{ color: '#888' }}>Last Updated</TableCell>
                    <TableCell sx={{ color: '#888' }}>Time in Current Stage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batches.slice(0, 10).map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell sx={{ color: '#fff' }}>{batch.batch_name}</TableCell>
                      <TableCell><Chip label={getStatusLabel(batch.status)} size="small" color={getStatusColor(batch.status)} /></TableCell>
                      <TableCell sx={{ color: '#888' }}>{new Date(batch.created_at).toLocaleString()}</TableCell>
                      <TableCell sx={{ color: '#888' }}>{new Date(batch.updated_at).toLocaleString()}</TableCell>
                      <TableCell sx={{ color: '#888' }}>
                        {Math.round((new Date().getTime() - new Date(batch.created_at).getTime()) / 60000)} min
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Create Batch Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' } }}>
          <DialogTitle sx={{ color: '#00ff88' }}>Create New Wafer Batch</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label="Batch Name" fullWidth value={newBatch.batch_name} onChange={(e) => setNewBatch({ ...newBatch, batch_name: e.target.value })} placeholder="e.g., BATCH-2024-001" sx={{ input: { color: '#fff' }, label: { color: '#888' }, mb: 2 }} />
            <TextField margin="dense" label="Product Type" fullWidth value={newBatch.product_type} onChange={(e) => setNewBatch({ ...newBatch, product_type: e.target.value })} sx={{ input: { color: '#fff' }, label: { color: '#888' }, mb: 2 }} />
            <TextField margin="dense" label="Total Wafers (20-30)" type="number" fullWidth value={newBatch.total_wafers} onChange={(e) => setNewBatch({ ...newBatch, total_wafers: parseInt(e.target.value) || 0 })} inputProps={{ min: 20, max: 30 }} sx={{ input: { color: '#fff' }, label: { color: '#888' } }} />
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
      </Container>
    </Box>
  );
};

export default WaferProduction;
