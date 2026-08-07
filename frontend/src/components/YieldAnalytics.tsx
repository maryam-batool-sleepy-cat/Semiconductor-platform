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
} from '@mui/material';
import { Refresh, TrendingUp, TrendingDown, Assessment } from '@mui/icons-material';
import Navigation from './Navigation';
import { yieldService } from '../services/api';

const YieldAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [reportRes, trendsRes] = await Promise.all([
        yieldService.getQualityReport(),
        yieldService.getTrends(7),
      ]);
      setData(reportRes.data);
      setTrends(trendsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching yield data:', error);
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000' }}>
        <Typography color="#33ff99">Loading yield analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(51,255,153,0.03)', border: '1px solid rgba(51,255,153,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#33ff99', fontWeight: 'bold' }}>📈 Yield Analytics</Typography>
              <Typography variant="body1" sx={{ color: '#aaaaaa', mt: 1 }}>
                Analyse wafer yields, monitor defect rates, and analyse process variation.
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
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(51,255,153,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Overall Yield</Typography>
                <Typography variant="h4" sx={{ color: '#33ff99', fontWeight: 'bold' }}>{data.overall_yield || 0}%</Typography>
                <TrendingUp sx={{ color: '#33ff99', mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,107,107,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Avg Defects</Typography>
                <Typography variant="h4" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>{data.average_defects || 0}</Typography>
                <TrendingDown sx={{ color: '#ff6b6b', mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(51,255,153,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Quality Score</Typography>
                <Typography variant="h4" sx={{ color: '#66ffbb', fontWeight: 'bold' }}>{data.quality_score || 0}%</Typography>
                <Assessment sx={{ color: '#66ffbb', mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(51,255,153,0.1)' }}>
              <CardContent>
                <Typography color="#888" gutterBottom>Wafers Analyzed</Typography>
                <Typography variant="h4" sx={{ color: '#33ff99', fontWeight: 'bold' }}>{data.analyzed_wafers || 0}</Typography>
                <Typography variant="body2" color="#888">Out of {data.total_wafers || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Batch Performance */}
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#33ff99', mb: 2 }}>📊 Batch Performance</Typography>
          <Grid container spacing={2}>
            {data.batch_performance?.map((batch: any) => (
              <Grid item xs={12} sm={6} md={4} key={batch.batch_id}>
                <Card sx={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(51,255,153,0.05)' }}>
                  <CardContent>
                    <Typography color="#888" variant="caption">Batch #{batch.batch_id}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Box>
                        <Typography variant="body2" color="#888">Yield</Typography>
                        <Typography sx={{ color: batch.yield > 90 ? '#33ff99' : '#ffaa33' }}>{batch.yield}%</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="#888">Quality</Typography>
                        <Typography sx={{ color: batch.quality > 85 ? '#33ff99' : '#ffaa33' }}>{batch.quality}%</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="#888">Defects</Typography>
                        <Typography sx={{ color: batch.defects < 3 ? '#33ff99' : '#ff6b6b' }}>{batch.defects}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Trend Analysis */}
        {trends && (
          <Paper sx={{ p: 3, mt: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ color: '#33ff99', mb: 2 }}>📈 Trend Analysis</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography color="#888" variant="caption">Average Yield</Typography>
                <Typography sx={{ color: '#33ff99' }}>{trends.average_yield || 0}%</Typography>
              </Box>
              <Box>
                <Typography color="#888" variant="caption">Trend</Typography>
                <Chip label={trends.trend || 'stable'} size="small" color={trends.trend === 'improving' ? 'success' : 'warning'} />
              </Box>
              <Box>
                <Typography color="#888" variant="caption">Records</Typography>
                <Typography sx={{ color: '#fff' }}>{trends.total_records || 0}</Typography>
              </Box>
              <Box>
                <Typography color="#888" variant="caption">Period</Typography>
                <Typography sx={{ color: '#fff' }}>{trends.period_days || 0} days</Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default YieldAnalytics;
