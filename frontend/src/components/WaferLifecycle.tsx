import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Timeline,
  CheckCircle,
  Pending,
  Cancel,
  Factory,
  PlayArrow,
  Refresh,
} from '@mui/icons-material';
import Navigation from './Navigation';
import { waferService } from '../services/api';

const WaferLifecycle: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showWafers, setShowWafers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const stages = ['registered', 'lithography', 'etching', 'deposition', 'inspection', 'completed'];
  const stageLabels = ['Registered', 'Lithography', 'Etching', 'Deposition', 'Inspection', 'Completed'];
  const stageColors = ['#888', '#00ff88', '#00cc66', '#33ff99', '#66ffbb', '#00ff88'];

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await waferService.getBatches();
      setBatches(response.data.batches || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lifecycle data:', error);
      setLoading(false);
    }
  };

  const handleViewWafers = async (batch: any) => {
    try {
      const response = await waferService.getBatchHistory(batch.id);
      setSelectedBatch(response.data);
      setShowWafers(true);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load wafer details', severity: 'error' });
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
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update stage', severity: 'error' });
    }
  };

  const getStatusLabel = (status: string) => status.replace('_', ' ').toUpperCase();
  const getStageStep = (stage: string) => stages.indexOf(stage);

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

  const totalBatches = batches.length;
  const completedBatches = batches.filter(b => b.status === 'completed').length;
  const inProgressBatches = batches.filter(b => b.status !== 'completed' && b.status !== 'rejected').length;
  const rejectedBatches = batches.filter(b => b.status === 'rejected').length;

  const stageDistribution = stages.map((stage, index) => ({
    stage: stageLabels[index],
    count: batches.filter(b => b.status === stage).length,
    color: stageColors[index],
  }));

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                🔄 Wafer Lifecycle Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: '#aaaaaa', mt: 1 }}>
                Complete wafer lifecycle tracking from registration to completion. Click any batch to view individual wafers.
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} sx={{ color: '#888' }}><Refresh /></IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,136,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Total Batches</Typography>
                <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 'bold' }}>{totalBatches}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,204,102,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Completed</Typography>
                <Typography variant="h4" sx={{ color: '#00cc66', fontWeight: 'bold' }}>{completedBatches}</Typography>
                <Typography variant="body2" color="#888">✅ Fully processed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,170,51,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>In Progress</Typography>
                <Typography variant="h4" sx={{ color: '#ffaa33', fontWeight: 'bold' }}>{inProgressBatches}</Typography>
                <Typography variant="body2" color="#888">⏳ Being processed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,107,107,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Rejected</Typography>
                <Typography variant="h4" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>{rejectedBatches}</Typography>
                <Typography variant="body2" color="#888">❌ Quality failed</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Stage Distribution */}
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>📊 Stage Distribution</Typography>
          <Grid container spacing={2}>
            {stageDistribution.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.stage}>
                <Card sx={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${item.color}20` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: item.color }}>{item.stage}</Typography>
                      <Chip label={item.count} size="small" sx={{ bgcolor: item.color, color: '#000' }} />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={totalBatches > 0 ? (item.count / totalBatches) * 100 : 0} 
                      sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: item.color } }} 
                    />
                    <Typography variant="caption" color="#888" sx={{ mt: 0.5, display: 'block' }}>
                      {totalBatches > 0 ? Math.round((item.count / totalBatches) * 100) : 0}% of total
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Batch Lifecycles */}
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>🔄 Batch Lifecycles</Typography>
          <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
            Click any batch to view individual wafers and their completion status.
          </Typography>
          <Grid container spacing={2}>
            {loading ? (
              <Box sx={{ width: '100%', py: 4 }}><LinearProgress sx={{ bgcolor: 'rgba(0,255,136,0.1)' }} /></Box>
            ) : batches.length === 0 ? (
              <Typography sx={{ color: '#888', textAlign: 'center', width: '100%', py: 4 }}>No batches registered</Typography>
            ) : (
              batches.map((batch) => (
                <Grid item xs={12} md={6} key={batch.id}>
                  <Card 
                    sx={{ 
                      background: 'rgba(0,0,0,0.4)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#00ff88',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => handleViewWafers(batch)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{batch.batch_name}</Typography>
                        <Chip 
                          label={batch.status === 'completed' ? '✅ COMPLETE' : getStatusLabel(batch.status)} 
                          size="small" 
                          color={getStatusColor(batch.status)} 
                        />
                      </Box>
                      <Stepper 
                        activeStep={getStageStep(batch.status)} 
                        orientation="horizontal" 
                        sx={{ mt: 1, '& .MuiStepConnector-root': { display: 'none' } }}
                      >
                        {stageLabels.map((label, index) => (
                          <Step key={index} completed={getStageStep(batch.status) >= index}>
                            <StepLabel 
                              StepIconComponent={() => (
                                <Box sx={{ 
                                  width: 20, 
                                  height: 20, 
                                  borderRadius: '50%', 
                                  bgcolor: getStageStep(batch.status) >= index ? '#00ff88' : 'rgba(255,255,255,0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: getStageStep(batch.status) >= index ? '#000' : '#888',
                                  fontSize: 10,
                                }}>
                                  {getStageStep(batch.status) >= index ? '✓' : index + 1}
                                </Box>
                              )}
                            >
                              <Typography variant="caption" sx={{ color: getStageStep(batch.status) >= index ? '#00ff88' : '#888', fontSize: 8 }}>
                                {label}
                              </Typography>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="#888">
                          Created: {new Date(batch.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="#888">
                          Progress: {Math.round((getStageStep(batch.status) / 5) * 100)}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#00ff88' }}>
                          Click to view wafers →
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Paper>

        {/* Wafer Details Dialog */}
        <Dialog 
          open={showWafers} 
          onClose={() => setShowWafers(false)} 
          maxWidth="md" 
          fullWidth 
          PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' } }}
        >
          <DialogTitle sx={{ color: '#00ff88' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Factory />
              Wafers in: {selectedBatch?.batch?.batch_name}
              <Chip 
                label={selectedBatch?.batch?.status === 'completed' ? '✅ COMPLETE' : getStatusLabel(selectedBatch?.batch?.status)} 
                size="small" 
                color={getStatusColor(selectedBatch?.batch?.status)} 
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedBatch && (
              <Box>
                <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography color="#888" variant="caption">Product Type</Typography>
                    <Typography color="#fff">{selectedBatch.batch.product_type}</Typography>
                  </Box>
                  <Box>
                    <Typography color="#888" variant="caption">Total Wafers</Typography>
                    <Typography color="#fff">{selectedBatch.batch.total_wafers}</Typography>
                  </Box>
                  <Box>
                    <Typography color="#888" variant="caption">Completed</Typography>
                    <Typography color="#00ff88">{selectedBatch.completed}/{selectedBatch.total_wafers}</Typography>
                  </Box>
                  <Box>
                    <Typography color="#888" variant="caption">Completion Rate</Typography>
                    <Typography color="#00ff88">
                      {selectedBatch.total_wafers > 0 ? Math.round((selectedBatch.completed / selectedBatch.total_wafers) * 100) : 0}%
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />

                <Typography variant="subtitle2" sx={{ color: '#00ff88', mb: 2 }}>
                  📋 Individual Wafers - Click ▶ to advance through stages
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#888' }}>Wafer ID</TableCell>
                        <TableCell sx={{ color: '#888' }}>Position</TableCell>
                        <TableCell sx={{ color: '#888' }}>Current Stage</TableCell>
                        <TableCell sx={{ color: '#888' }}>Status</TableCell>
                        <TableCell sx={{ color: '#888' }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedBatch.wafers?.map((wafer: any) => {
                        const isCompleted = wafer.current_stage === 'completed';
                        const isRejected = wafer.current_stage === 'rejected';
                        return (
                          <TableRow key={wafer.id} sx={{ 
                            bgcolor: isCompleted ? 'rgba(0,255,136,0.05)' : 'transparent',
                          }}>
                            <TableCell sx={{ color: '#fff' }}>{wafer.wafer_id}</TableCell>
                            <TableCell sx={{ color: '#aaa' }}>{wafer.position}</TableCell>
                            <TableCell>
                              <Chip 
                                label={getStatusLabel(wafer.current_stage)} 
                                size="small" 
                                color={getStatusColor(wafer.current_stage)} 
                              />
                            </TableCell>
                            <TableCell>
                              {isCompleted ? (
                                <Chip label="✅ COMPLETE" size="small" color="success" />
                              ) : isRejected ? (
                                <Chip label="❌ REJECTED" size="small" color="error" />
                              ) : (
                                <Chip label="⏳ IN PROGRESS" size="small" color="warning" />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {!isCompleted && !isRejected && (
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  {['lithography', 'etching', 'deposition', 'inspection', 'completed'].map((stage) => {
                                    const currentIndex = stages.indexOf(wafer.current_stage);
                                    const targetIndex = stages.indexOf(stage);
                                    if (targetIndex === currentIndex + 1) {
                                      return (
                                        <Tooltip key={stage} title={`Move to ${stage}`}>
                                          <IconButton 
                                            size="small" 
                                            onClick={() => handleUpdateStage(wafer.wafer_id, stage)} 
                                            sx={{ color: stage === 'completed' ? '#00ff88' : '#66ffbb' }}
                                          >
                                            <PlayArrow fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      );
                                    }
                                    return null;
                                  })}
                                </Box>
                              )}
                              {isCompleted && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CheckCircle sx={{ color: '#00ff88' }} />
                                  <Typography variant="caption" sx={{ color: '#00ff88' }}>Done</Typography>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Completion Progress */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="#888" gutterBottom>
                    Batch Completion Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedBatch.total_wafers > 0 ? (selectedBatch.completed / selectedBatch.total_wafers) * 100 : 0} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': { 
                        bgcolor: selectedBatch.completed === selectedBatch.total_wafers ? '#00ff88' : '#33ff99',
                        borderRadius: 5,
                      } 
                    }} 
                  />
                  <Typography variant="caption" color="#888" sx={{ mt: 0.5, display: 'block' }}>
                    {selectedBatch.completed} / {selectedBatch.total_wafers} wafers completed 
                    ({selectedBatch.total_wafers > 0 ? Math.round((selectedBatch.completed / selectedBatch.total_wafers) * 100) : 0}%)
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowWafers(false)} sx={{ color: '#888' }}>Close</Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default WaferLifecycle;
