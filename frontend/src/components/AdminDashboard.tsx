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
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Refresh, AdminPanelSettings } from '@mui/icons-material';
import Navigation from './Navigation';
import { dashboardService, waferService } from '../services/api';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, batchesRes] = await Promise.all([
        dashboardService.getOverview(),
        waferService.getBatches(),
      ]);
      setData(dashboardRes.data);
      setBatches(batchesRes.data.batches || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000' }}>
        <Typography color="#00ff88">Loading admin dashboard...</Typography>
      </Box>
    );
  }

  const { wafer_metrics, equipment_metrics, quality_metrics, maintenance_metrics } = data;

  const adminKPIs = [
    { label: 'Active Wafer Batches', value: batches.filter((b: any) => b.status !== 'completed').length, color: '#00ff88' },
    { label: 'Production Throughput', value: `${wafer_metrics.throughput_24h || 0}/day`, color: '#00cc66' },
    { label: 'Equipment Utilization', value: `${equipment_metrics.utilization_rate || 0}%`, color: '#33ff99' },
    { label: 'Manufacturing Efficiency', value: `${quality_metrics.average_yield || 0}%`, color: '#66ffbb' },
    { label: 'Wafer Yield', value: `${quality_metrics.latest_yield || 0}%`, color: '#00ff88' },
    { label: 'Defect Statistics', value: quality_metrics.average_defects || 0, color: '#ff6b6b' },
    { label: 'Maintenance Status', value: `${maintenance_metrics.pending_maintenance || 0} Pending`, color: '#ffaa33' },
    { label: 'Factory KPIs', value: 'Active', color: '#33ff99' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                👑 Executive Admin Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: '#aaaaaa', mt: 1 }}>
                Executive operational reports and manufacturing performance trends.
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} sx={{ color: '#888' }}><Refresh /></IconButton>
            </Tooltip>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {adminKPIs.map((kpi) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.label}>
              <Card sx={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${kpi.color}20` }}>
                <CardContent>
                  <Typography color="#888" gutterBottom variant="body2">{kpi.label}</Typography>
                  <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 'bold' }}>{kpi.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>📊 Manufacturing Performance</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="#888">Yield Trend</Typography>
                    <Typography color="#00ff88">{quality_metrics.average_yield || 0}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={quality_metrics.average_yield || 0} sx={{ bgcolor: 'rgba(0,255,136,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00ff88' } }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="#888">Equipment Utilization</Typography>
                    <Typography color="#00cc66">{equipment_metrics.utilization_rate || 0}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={equipment_metrics.utilization_rate || 0} sx={{ bgcolor: 'rgba(0,204,102,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00cc66' } }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="#888">Quality Score</Typography>
                    <Typography color="#33ff99">{quality_metrics.quality_score || 0}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={quality_metrics.quality_score || 0} sx={{ bgcolor: 'rgba(51,255,153,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#33ff99' } }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="#888">Production Throughput</Typography>
                    <Typography color="#66ffbb">{wafer_metrics.throughput_24h || 0}/day</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={Math.min((wafer_metrics.throughput_24h || 0) * 2, 100)} sx={{ bgcolor: 'rgba(102,255,187,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#66ffbb' } }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>📋 Executive Report</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="#888">Total Wafers</Typography>
                  <Typography color="#fff">{wafer_metrics.total_wafers || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="#888">Active Batches</Typography>
                  <Typography color="#fff">{batches.filter((b: any) => b.status !== 'completed').length}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="#888">Total Equipment</Typography>
                  <Typography color="#fff">{equipment_metrics.total_equipment || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="#888">Maintenance Alerts</Typography>
                  <Typography color="#ff6b6b">{maintenance_metrics.alerts_generated || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="#888">Avg Defects</Typography>
                  <Typography color="#ff6b6b">{quality_metrics.average_defects || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="#888">Quality Score</Typography>
                  <Typography color="#33ff99">{quality_metrics.quality_score || 0}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="#888">Defect Trend</Typography>
                  <Chip label={quality_metrics.average_defects < 3 ? 'Improving' : 'Needs Attention'} size="small" color={quality_metrics.average_defects < 3 ? 'success' : 'error'} />
                </Grid>
                <Grid item xs={6}>
                  <Typography color="#888">Yield Trend</Typography>
                  <Chip label={quality_metrics.average_yield > 90 ? 'Excellent' : 'Optimizing'} size="small" color={quality_metrics.average_yield > 90 ? 'success' : 'warning'} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>📋 Active Wafer Batches</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#888' }}>Batch Name</TableCell>
                  <TableCell sx={{ color: '#888' }}>Product Type</TableCell>
                  <TableCell sx={{ color: '#888' }}>Wafers</TableCell>
                  <TableCell sx={{ color: '#888' }}>Status</TableCell>
                  <TableCell sx={{ color: '#888' }}>Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.filter((b: any) => b.status !== 'completed').slice(0, 5).map((batch: any) => (
                  <TableRow key={batch.id}>
                    <TableCell sx={{ color: '#fff' }}>{batch.batch_name}</TableCell>
                    <TableCell sx={{ color: '#aaa' }}>{batch.product_type}</TableCell>
                    <TableCell sx={{ color: '#aaa' }}>{batch.total_wafers}</TableCell>
                    <TableCell><Chip label={batch.status} size="small" color="warning" /></TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={Math.random() * 80 + 20}
                        sx={{ width: 100, bgcolor: 'rgba(0,255,136,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00ff88' } }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {batches.filter((b: any) => b.status !== 'completed').length === 0 && (
                  <TableRow><TableCell colSpan={5} sx={{ color: '#888', textAlign: 'center', py: 2 }}>No active batches</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
