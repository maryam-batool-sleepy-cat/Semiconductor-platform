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
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Refresh, Speed, CheckCircle, Warning, Error, Build, Schedule } from '@mui/icons-material';
import Navigation from './Navigation';
import { equipmentService } from '../services/api';

const EquipmentHealth: React.FC = () => {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchEquipment();
    const interval = setInterval(fetchEquipment, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentService.getEquipment();
      setEquipment(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle sx={{ color: '#00ff88' }} />;
      case 'maintenance': return <Build sx={{ color: '#ffaa33' }} />;
      case 'degraded': return <Warning sx={{ color: '#ff6b6b' }} />;
      case 'standby': return <Schedule sx={{ color: '#66ffbb' }} />;
      case 'offline': return <Error sx={{ color: '#666' }} />;
      default: return <Speed />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#00ff88';
      case 'maintenance': return '#ffaa33';
      case 'degraded': return '#ff6b6b';
      case 'standby': return '#66ffbb';
      case 'offline': return '#666';
      default: return '#888';
    }
  };

  const equipmentTypes = ['lithography', 'etching', 'deposition', 'inspection'];

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 1 }}>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(0,204,102,0.03)', border: '1px solid rgba(0,204,102,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#00cc66', fontWeight: 'bold' }}>🔧 Equipment Health Monitoring</Typography>
              <Typography variant="body1" sx={{ color: '#aaaaaa', mt: 1 }}>
                Monitor lithography machines, etching systems, deposition systems, and inspection equipment.
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchEquipment} sx={{ color: '#888' }}><Refresh /></IconButton>
            </Tooltip>
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {equipmentTypes.map((type) => {
            const typeEquipment = equipment.filter(e => e.type === type);
            const operational = typeEquipment.filter(e => e.status === 'operational').length;
            const total = typeEquipment.length;
            const percentage = total > 0 ? (operational / total) * 100 : 0;

            return (
              <Grid item xs={12} sm={6} md={3} key={type}>
                <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,204,102,0.1)' }}>
                  <CardContent>
                    <Typography color="#888" gutterBottom>{type.toUpperCase()}</Typography>
                    <Typography variant="h4" sx={{ color: '#00cc66' }}>{operational}/{total}</Typography>
                    <LinearProgress variant="determinate" value={percentage} sx={{ mt: 1, bgcolor: 'rgba(0,204,102,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00cc66' } }} />
                    <Typography variant="body2" color="#888" sx={{ mt: 1 }}>{percentage.toFixed(0)}% Operational</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#00cc66', mb: 2 }}>📋 All Equipment</Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#888' }}>Equipment</TableCell>
                  <TableCell sx={{ color: '#888' }}>Type</TableCell>
                  <TableCell sx={{ color: '#888' }}>Status</TableCell>
                  <TableCell sx={{ color: '#888' }}>Operating Hours</TableCell>
                  <TableCell sx={{ color: '#888' }}>Uptime %</TableCell>
                  <TableCell sx={{ color: '#888' }}>Downtime %</TableCell>
                  <TableCell sx={{ color: '#888' }}>Availability</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} sx={{ py: 4 }}><LinearProgress sx={{ bgcolor: 'rgba(0,204,102,0.1)' }} /></TableCell></TableRow>
                ) : equipment.length === 0 ? (
                  <TableRow><TableCell colSpan={7} sx={{ color: '#888', textAlign: 'center', py: 4 }}>No equipment registered</TableCell></TableRow>
                ) : (
                  equipment.map((eq: any) => (
                    <TableRow key={eq.id}>
                      <TableCell sx={{ color: '#fff' }}>{eq.name}</TableCell>
                      <TableCell sx={{ color: '#aaa' }}>{eq.type}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(eq.status)}
                          <Chip label={eq.status} size="small" sx={{ color: getStatusColor(eq.status), borderColor: getStatusColor(eq.status) }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#aaa' }}>{eq.operating_hours?.toFixed(1) || 0}</TableCell>
                      <TableCell sx={{ color: eq.uptime_percentage > 90 ? '#00ff88' : '#ffaa33' }}>
                        {eq.uptime_percentage?.toFixed(1) || 0}%
                      </TableCell>
                      <TableCell sx={{ color: eq.downtime_percentage < 10 ? '#00ff88' : '#ff6b6b' }}>
                        {eq.downtime_percentage?.toFixed(1) || 0}%
                      </TableCell>
                      <TableCell sx={{ color: eq.availability > 85 ? '#00ff88' : '#ffaa33' }}>
                        {eq.availability?.toFixed(1) || 0}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default EquipmentHealth;
