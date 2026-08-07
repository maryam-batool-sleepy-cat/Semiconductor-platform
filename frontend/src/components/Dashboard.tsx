import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  Factory,
  Speed,
  Assessment,
  Warning,
  ArrowForward,
} from '@mui/icons-material';
import Navigation from './Navigation';
import { dashboardService } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await dashboardService.getOverview();
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000' }}>
        <Typography color="#00ff88">Loading dashboard...</Typography>
      </Box>
    );
  }

  const { wafer_metrics, equipment_metrics, quality_metrics, maintenance_metrics } = data;

  const sections = [
    {
      title: 'Wafer Production',
      icon: <Factory sx={{ fontSize: 40 }} />,
      color: '#00ff88',
      description: 'Register batches, track movement, monitor fabrication progress',
      path: '/wafer-production',
      metrics: [
        { label: 'Total Wafers', value: wafer_metrics.total_wafers || 0 },
        { label: 'Active', value: wafer_metrics.active_wafers || 0 },
      ],
    },
    {
      title: 'Equipment Health',
      icon: <Speed sx={{ fontSize: 40 }} />,
      color: '#00cc66',
      description: 'Monitor lithography, etching, deposition, inspection equipment',
      path: '/equipment-health',
      metrics: [
        { label: 'Total Equipment', value: equipment_metrics.total_equipment || 0 },
        { label: 'Operational', value: equipment_metrics.operational || 0 },
      ],
    },
    {
      title: 'Yield Analytics',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#33ff99',
      description: 'Analyse wafer yields, defect rates, process variation',
      path: '/yield-analytics',
      metrics: [
        { label: 'Average Yield', value: `${quality_metrics.average_yield || 0}%` },
        { label: 'Defects', value: quality_metrics.average_defects || 0 },
      ],
    },
    {
      title: 'Maintenance Status',
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: '#ffaa33',
      description: 'Predict maintenance schedules, track maintenance history',
      path: '/maintenance',
      metrics: [
        { label: 'Alerts', value: maintenance_metrics.alerts_generated || 0 },
        { label: 'Pending', value: maintenance_metrics.pending_maintenance || 0 },
      ],
    },
  ];

  const kpiData = [
    { label: 'Total Wafers', value: wafer_metrics.total_wafers || 0, color: '#00ff88', subtitle: `Throughput: ${wafer_metrics.throughput_24h || 0}` },
    { label: 'Equipment Utilization', value: `${equipment_metrics.utilization_rate || 0}%`, color: '#00cc66', subtitle: `${equipment_metrics.operational || 0}/${equipment_metrics.total_equipment || 0} Operational` },
    { label: 'Average Yield', value: `${quality_metrics.average_yield || 0}%`, color: '#33ff99', subtitle: `Defects: ${quality_metrics.average_defects || 0}` },
    { label: 'Maintenance Alerts', value: maintenance_metrics.alerts_generated || 0, color: '#ff6b6b', subtitle: `${maintenance_metrics.pending_maintenance || 0} Pending` },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 4, mb: 4, background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.05)' }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#00ff88', fontWeight: 'bold' }}>
            🏭 Semiconductor Manufacturing Operations Platform
          </Typography>
          <Typography variant="body1" sx={{ color: '#aaaaaa', maxWidth: 900, mb: 3, lineHeight: 1.8 }}>
            Welcome to the NanoChip Semiconductor Manufacturing Operations Platform.
            This system provides real-time monitoring and management of wafer production,
            equipment health, yield analytics, and maintenance operations.
            Click on any section below to access detailed features.
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {sections.map((section) => (
              <Box key={section.title} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {React.cloneElement(section.icon, { sx: { color: section.color, fontSize: 20 } })}
                <Typography variant="body2" sx={{ color: '#888' }}>{section.title}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {kpiData.map((kpi) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.label}>
              <Card sx={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${kpi.color}20` }}>
                <CardContent>
                  <Typography color="#888" gutterBottom variant="body2">{kpi.label}</Typography>
                  <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 'bold' }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="body2" color="#666" sx={{ mt: 1 }}>
                    {kpi.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section Cards */}
        <Grid container spacing={3}>
          {sections.map((section) => (
            <Grid item xs={12} md={6} key={section.title}>
              <Card
                sx={{
                  background: 'rgba(0,0,0,0.6)',
                  border: `1px solid ${section.color}20`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: section.color,
                    boxShadow: `0 8px 32px ${section.color}10`,
                  },
                }}
                onClick={() => navigate(section.path)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: section.color }}>
                        {section.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {section.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888' }}>
                          {section.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                          {section.metrics.map((metric) => (
                            <Box key={metric.label}>
                              <Typography variant="caption" color="#666">{metric.label}</Typography>
                              <Typography variant="body2" sx={{ color: section.color, fontWeight: 600 }}>
                                {metric.value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                    <ArrowForward sx={{ color: section.color }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', pt: 3 }}>
          <Typography variant="body2" color="#444">
            © 2026 NanoChip Semiconductor Corporation • Data refreshes every 30 seconds
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
