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
} from '@mui/material';
import {
  Timeline,
  CheckCircle,
  Pending,
  Cancel,
  Factory,
} from '@mui/icons-material';
import Navigation from './Navigation';
import { waferService } from '../services/api';

const WaferLifecycle: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const getStatusLabel = (status: string) => status.replace('_', ' ').toUpperCase();
  const getStageStep = (stage: string) => stages.indexOf(stage);

  // Calculate lifecycle metrics
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
          <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
            🔄 Wafer Lifecycle Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#aaaaaa', mt: 1 }}>
            Complete wafer lifecycle tracking from registration to completion.
          </Typography>
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
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,170,51,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>In Progress</Typography>
                <Typography variant="h4" sx={{ color: '#ffaa33', fontWeight: 'bold' }}>{inProgressBatches}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,107,107,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Rejected</Typography>
                <Typography variant="h4" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>{rejectedBatches}</Typography>
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

        {/* Individual Batch Lifecycles */}
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>🔄 Batch Lifecycles</Typography>
          <Grid container spacing={2}>
            {loading ? (
              <Box sx={{ width: '100%', py: 4 }}><LinearProgress sx={{ bgcolor: 'rgba(0,255,136,0.1)' }} /></Box>
            ) : batches.length === 0 ? (
              <Typography sx={{ color: '#888', textAlign: 'center', width: '100%', py: 4 }}>No batches registered</Typography>
            ) : (
              batches.map((batch) => (
                <Grid item xs={12} md={6} key={batch.id}>
                  <Card sx={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{batch.batch_name}</Typography>
                        <Chip label={getStatusLabel(batch.status)} size="small" color={getStatusColor(batch.status)} />
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
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

// Helper function for status color
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

export default WaferLifecycle;
