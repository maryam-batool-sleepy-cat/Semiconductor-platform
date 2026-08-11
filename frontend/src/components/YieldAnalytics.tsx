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
  Chip,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  Assessment,
  ShowChart,
  Warning,
  CheckCircle,
  Info,
  Print,
} from '@mui/icons-material';
import Navigation from './Navigation';
import { yieldService } from '../services/api';

const YieldAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [variation, setVariation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [reportRes, trendsRes, variationRes] = await Promise.all([
        yieldService.getQualityReport(),
        yieldService.getTrends(7),
        yieldService.getProcessVariation(),
      ]);
      setData(reportRes.data);
      setTrends(trendsRes.data);
      setVariation(variationRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching yield data:', error);
      setLoading(false);
    }
  };

  if (loading || !data || !trends) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000' }}>
        <Typography color="#33ff99">Loading yield analytics...</Typography>
      </Box>
    );
  }

  const getTrendIcon = () => {
    if (trends.trend === 'improving') return <TrendingUp sx={{ color: '#00ff88' }} />;
    if (trends.trend === 'declining') return <TrendingDown sx={{ color: '#ff6b6b' }} />;
    return <ShowChart sx={{ color: '#ffaa33' }} />;
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(51,255,153,0.03)', border: '1px solid rgba(51,255,153,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#33ff99', fontWeight: 'bold' }}>📈 Yield Analytics</Typography>
              <Typography variant="body1" sx={{ color: '#aaaaaa', mt: 1 }}>
                Analyse wafer yields, monitor defect rates, analyse process variation, and generate quality reports.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => setReportOpen(true)}
                sx={{ color: '#33ff99', borderColor: '#33ff99' }}
              >
                Quality Report
              </Button>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchData} sx={{ color: '#888' }}><Refresh /></IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(51,255,153,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Overall Yield</Typography>
                <Typography variant="h4" sx={{ color: '#33ff99', fontWeight: 'bold' }}>{data.overall_yield || 0}%</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTrendIcon()}
                  <Typography variant="caption" color="#888">{trends.trend || 'stable'}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,107,107,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Avg Defects</Typography>
                <Typography variant="h4" sx={{ color: data.average_defects < 2 ? '#00ff88' : '#ff6b6b', fontWeight: 'bold' }}>
                  {data.average_defects || 0}
                </Typography>
                <Typography variant="caption" color="#888">per wafer</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(51,255,153,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Quality Score</Typography>
                <Typography variant="h4" sx={{ color: '#66ffbb', fontWeight: 'bold' }}>{data.quality_score || 0}%</Typography>
                <LinearProgress variant="determinate" value={data.quality_score || 0} sx={{ mt: 1, bgcolor: 'rgba(51,255,153,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#33ff99' } }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(51,255,153,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Production Efficiency</Typography>
                <Typography variant="h4" sx={{ color: data.production_efficiency > 90 ? '#00ff88' : '#ffaa33', fontWeight: 'bold' }}>
                  {data.production_efficiency || 0}%
                </Typography>
                <Typography variant="caption" color="#888">ISA-95 Level 3</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Trend Analysis & Production Efficiency */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ color: '#33ff99', mb: 2 }}>📊 Trend Analysis</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography color="#888" variant="caption">Direction</Typography>
                    <Typography sx={{ color: trends.trend === 'improving' ? '#00ff88' : trends.trend === 'declining' ? '#ff6b6b' : '#ffaa33' }}>
                      {trends.trend || 'stable'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography color="#888" variant="caption">Improvement Rate</Typography>
                    <Typography sx={{ color: '#33ff99' }}>{trends.trend_analysis?.improvement_rate || 0}%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography color="#888" variant="caption">Consistency</Typography>
                    <Typography sx={{ color: trends.trend_analysis?.consistency_score > 80 ? '#00ff88' : '#ffaa33' }}>
                      {trends.trend_analysis?.consistency_score || 0}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography color="#888" variant="caption">Projected Yield</Typography>
                    <Typography sx={{ color: '#33ff99' }}>{trends.trend_analysis?.projected_yield || 0}%</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ color: '#33ff99', mb: 2 }}>⚡ Production Efficiency</Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ color: data.production_efficiency > 90 ? '#00ff88' : '#ffaa33' }}>
                  {data.production_efficiency || 0}%
                </Typography>
                <Typography variant="body2" color="#888">ISA-95 Level 3 Efficiency</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={data.production_efficiency || 0} 
                  sx={{ mt: 2, bgcolor: 'rgba(51,255,153,0.1)', height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: data.production_efficiency > 90 ? '#00ff88' : '#ffaa33', borderRadius: 4 } }} 
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Process Variation */}
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#33ff99', mb: 2 }}>📊 Process Variation Analysis (SEMI E10)</Typography>
          <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
            Analyse process variation across production stages.
          </Typography>
          {variation && variation.stage_variation ? (
            <Grid container spacing={2}>
              {Object.entries(variation.stage_variation || {}).map(([stage, data]: [string, any]) => (
                <Grid item xs={12} sm={6} md={3} key={stage}>
                  <Card sx={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${data.range < 3 ? 'rgba(0,255,136,0.2)' : 'rgba(255,107,107,0.2)'}` }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ color: '#fff' }}>{stage.toUpperCase()}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography color="#888" variant="caption">Range</Typography>
                        <Typography sx={{ color: data.range < 3 ? '#00ff88' : '#ff6b6b' }}>{data.range}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="#888" variant="caption">Min</Typography>
                        <Typography color="#aaa">{data.min}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="#888" variant="caption">Max</Typography>
                        <Typography color="#aaa">{data.max}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="#888" variant="caption">Avg</Typography>
                        <Typography sx={{ color: '#33ff99' }}>{data.avg}%</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography color="#888">Overall Range: {variation.overall_range || 0}%</Typography>
                  <Chip 
                    label={`Status: ${variation.status || 'unknown'}`} 
                    size="small" 
                    color={variation.status === 'stable' ? 'success' : variation.status === 'variable' ? 'warning' : 'error'} 
                  />
                  <Typography color="#888">Samples: {variation.total_samples || 0}</Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Typography color="#888">No process variation data available</Typography>
          )}
        </Paper>

        {/* Batch Performance */}
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#33ff99', mb: 2 }}>📋 Batch Performance</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#888' }}>Batch ID</TableCell>
                  <TableCell sx={{ color: '#888' }}>Yield %</TableCell>
                  <TableCell sx={{ color: '#888' }}>Quality %</TableCell>
                  <TableCell sx={{ color: '#888' }}>Defects</TableCell>
                  <TableCell sx={{ color: '#888' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.batch_performance?.map((batch: any) => (
                  <TableRow key={batch.batch_id}>
                    <TableCell sx={{ color: '#fff' }}>#{batch.batch_id}</TableCell>
                    <TableCell sx={{ color: batch.yield > 90 ? '#00ff88' : '#ffaa33' }}>{batch.yield}%</TableCell>
                    <TableCell sx={{ color: batch.quality > 85 ? '#00ff88' : '#ffaa33' }}>{batch.quality}%</TableCell>
                    <TableCell sx={{ color: batch.defects < 3 ? '#00ff88' : '#ff6b6b' }}>{batch.defects}</TableCell>
                    <TableCell>
                      <Chip 
                        label={batch.yield > 90 ? 'Excellent' : batch.yield > 80 ? 'Good' : 'Needs Improvement'} 
                        size="small" 
                        color={batch.yield > 90 ? 'success' : batch.yield > 80 ? 'warning' : 'error'} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(!data.batch_performance || data.batch_performance.length === 0) && (
                  <TableRow><TableCell colSpan={5} sx={{ color: '#888', textAlign: 'center', py: 4 }}>No batch performance data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Manufacturing Intelligence */}
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(51,255,153,0.1)' }}>
          <Typography variant="h6" sx={{ color: '#33ff99', mb: 2 }}>🧠 Manufacturing Intelligence</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>Insights</Typography>
              {data.manufacturing_intelligence?.insights?.map((insight: string, idx: number) => (
                <Alert key={idx} severity={insight.includes('✅') ? 'success' : insight.includes('⚠️') ? 'warning' : 'info'} sx={{ mb: 1, bgcolor: 'rgba(0,0,0,0.3)' }}>
                  {insight}
                </Alert>
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>Recommendations</Typography>
              {data.manufacturing_intelligence?.recommendations?.map((rec: string, idx: number) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, p: 1, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1 }}>
                  <Info sx={{ color: '#33ff99', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#aaa' }}>{rec}</Typography>
                </Box>
              ))}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(51,255,153,0.05)', borderRadius: 1 }}>
                <Typography variant="caption" color="#888">Summary</Typography>
                <Typography variant="body2" sx={{ color: '#33ff99' }}>
                  {data.manufacturing_intelligence?.summary || 'No summary available'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Quality Report Dialog */}
        <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(51,255,153,0.2)' } }}>
          <DialogTitle sx={{ color: '#33ff99' }}>
            📋 Quality Report - ISO 9001 Compliant
            <Chip label="ISO 9001" size="small" sx={{ ml: 2, color: '#33ff99', borderColor: '#33ff99' }} />
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#00ff88' }}>Summary</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mt: 1 }}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                    <Typography color="#888">Total Wafers</Typography>
                    <Typography color="#fff">{data.total_wafers || 0}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                    <Typography color="#888">Analyzed</Typography>
                    <Typography color="#00ff88">{data.analyzed_wafers || 0}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                    <Typography color="#888">Overall Yield</Typography>
                    <Typography color="#33ff99">{data.overall_yield || 0}%</Typography>
                  </Paper>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#00ff88', mt: 2 }}>Quality Metrics</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mt: 1 }}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                    <Typography color="#888">Quality Score</Typography>
                    <Typography color="#66ffbb">{data.quality_score || 0}%</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                    <Typography color="#888">Avg Defects</Typography>
                    <Typography color="#ff6b6b">{data.average_defects || 0}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                    <Typography color="#888">Efficiency</Typography>
                    <Typography color="#00cc66">{data.production_efficiency || 0}%</Typography>
                  </Paper>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#00ff88', mt: 2 }}>Process Variation</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mt: 1 }}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                    <Typography color="#888">Range</Typography>
                    <Typography color="#fff">{data.process_variation?.range || 0}%</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                    <Typography color="#888">Std Deviation</Typography>
                    <Typography color="#fff">{data.process_variation?.std_deviation || 0}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                    <Typography color="#888">Status</Typography>
                    <Chip label={data.process_variation?.status || 'unknown'} size="small" color={data.process_variation?.status === 'stable' ? 'success' : 'warning'} />
                  </Paper>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#00ff88', mt: 2 }}>Manufacturing Intelligence</Typography>
                <Box sx={{ mt: 1 }}>
                  {data.manufacturing_intelligence?.insights?.slice(0, 3).map((insight: string, idx: number) => (
                    <Alert key={idx} severity={insight.includes('✅') ? 'success' : insight.includes('⚠️') ? 'warning' : 'info'} sx={{ mb: 1, bgcolor: 'rgba(0,0,0,0.3)' }}>
                      {insight}
                    </Alert>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography color="#888" variant="caption" sx={{ mt: 2, display: 'block' }}>
                  Report Generated: {new Date(data.timestamp).toLocaleString()}
                </Typography>
                <Typography color="#888" variant="caption" sx={{ display: 'block' }}>
                  Standards: SEMI E10, ISO 9001, ISO 55001, ISA-95, COBIT 2019
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReportOpen(false)} sx={{ color: '#888' }}>Close</Button>
            <Button sx={{ color: '#33ff99' }}>Export PDF</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default YieldAnalytics;
