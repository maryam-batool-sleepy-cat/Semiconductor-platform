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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
} from '@mui/material';
import {
  Refresh,
  Speed,
  CheckCircle,
  Warning,
  Error,
  Build,
  Schedule,
  Assessment,
  TrendingUp,
  TrendingDown,
  Print,
} from '@mui/icons-material';
import Navigation from './Navigation';
import { equipmentService } from '../services/api';

const EquipmentHealth: React.FC = () => {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentRes, reportRes] = await Promise.all([
        equipmentService.getEquipment(),
        equipmentService.getEquipmentReport(),
      ]);
      setEquipment(equipmentRes.data);
      setReport(reportRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching equipment data:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = async (eq: any) => {
    try {
      const response = await equipmentService.getEquipmentHealth(eq.equipment_id);
      setSelectedEquipment(response.data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching equipment details:', error);
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
        {/* Header */}
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(0,204,102,0.03)', border: '1px solid rgba(0,204,102,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#00cc66', fontWeight: 'bold' }}>🔧 Equipment Health Monitoring</Typography>
              <Typography variant="body1" sx={{ color: '#aaaaaa', mt: 1 }}>
                Monitor lithography machines, etching systems, deposition systems, and inspection equipment.
                Track operating hours, generate health reports, and view operational dashboards.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Generate Report">
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={() => setReportOpen(true)}
                  sx={{ color: '#00cc66', borderColor: '#00cc66' }}
                >
                  Health Report
                </Button>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchData} sx={{ color: '#888' }}><Refresh /></IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Summary Cards - Operational Dashboard */}
        {report && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,204,102,0.1)' }}>
                <CardContent>
                  <Typography color="#888" gutterBottom>Total Equipment</Typography>
                  <Typography variant="h4" sx={{ color: '#00ff88' }}>{report.summary.total_equipment}</Typography>
                  <Typography variant="body2" color="#888">Operational: {report.summary.operational_count}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,136,0.1)' }}>
                <CardContent>
                  <Typography color="#888" gutterBottom>Utilization Rate</Typography>
                  <Typography variant="h4" sx={{ color: '#00cc66' }}>{report.summary.utilization_rate || 0}%</Typography>
                  <LinearProgress variant="determinate" value={report.summary.utilization_rate || 0} sx={{ mt: 1, bgcolor: 'rgba(0,204,102,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00cc66' } }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(51,255,153,0.1)' }}>
                <CardContent>
                  <Typography color="#888" gutterBottom>Avg Operating Hours</Typography>
                  <Typography variant="h4" sx={{ color: '#33ff99' }}>{report.metrics.avg_operating_hours || 0}</Typography>
                  <Typography variant="body2" color="#888">Health Score: {report.metrics.avg_health_score || 0}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,170,51,0.1)' }}>
                <CardContent>
                  <Typography color="#888" gutterBottom>Availability</Typography>
                  <Typography variant="h4" sx={{ color: '#ffaa33' }}>{report.metrics.overall_availability || 0}%</Typography>
                  <Typography variant="body2" color="#888">Uptime: {report.metrics.avg_uptime_hours || 0}h</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Equipment Type Summary */}
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

        {/* Equipment Table */}
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#00cc66' }}>📋 All Equipment</Typography>
            <Typography variant="body2" color="#888">
              Recording: {equipment.reduce((sum, e) => sum + (e.operating_hours || 0), 0)} total operating hours
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#888', fontWeight: 600 }}>Equipment</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 600 }}>Operating Hours</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 600 }}>Uptime %</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 600 }}>Downtime %</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 600 }}>Availability</TableCell>
                  <TableCell sx={{ color: '#888', fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} sx={{ py: 4 }}><LinearProgress sx={{ bgcolor: 'rgba(0,204,102,0.1)' }} /></TableCell></TableRow>
                ) : equipment.length === 0 ? (
                  <TableRow><TableCell colSpan={8} sx={{ color: '#888', textAlign: 'center', py: 4 }}>No equipment registered</TableCell></TableRow>
                ) : (
                  equipment.map((eq: any) => (
                    <TableRow key={eq.id}>
                      <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{eq.name}</TableCell>
                      <TableCell sx={{ color: '#aaa' }}>{eq.type}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(eq.status)}
                          <Chip label={eq.status} size="small" sx={{ color: getStatusColor(eq.status), borderColor: getStatusColor(eq.status) }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#aaa' }}>{eq.operating_hours?.toFixed(1) || 0}h</TableCell>
                      <TableCell sx={{ color: eq.uptime_percentage > 90 ? '#00ff88' : '#ffaa33' }}>
                        {eq.uptime_percentage?.toFixed(1) || 0}%
                      </TableCell>
                      <TableCell sx={{ color: eq.downtime_percentage < 10 ? '#00ff88' : '#ff6b6b' }}>
                        {eq.downtime_percentage?.toFixed(1) || 0}%
                      </TableCell>
                      <TableCell sx={{ color: eq.availability > 85 ? '#00ff88' : '#ffaa33' }}>
                        {eq.availability?.toFixed(1) || 0}%
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          onClick={() => handleViewDetails(eq)}
                          sx={{ color: '#00cc66' }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Equipment Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' } }}>
          <DialogTitle sx={{ color: '#00cc66' }}>
            📊 Equipment Details: {selectedEquipment?.name}
            <Chip label={selectedEquipment?.status} size="small" sx={{ ml: 2, color: getStatusColor(selectedEquipment?.status), borderColor: getStatusColor(selectedEquipment?.status) }} />
          </DialogTitle>
          <DialogContent>
            {selectedEquipment && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="#888" variant="caption">Equipment ID</Typography>
                    <Typography color="#fff">{selectedEquipment.equipment_id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="#888" variant="caption">Health Score</Typography>
                    <Typography color={selectedEquipment.health_score > 80 ? '#00ff88' : '#ff6b6b'}>
                      {selectedEquipment.health_score}% ({selectedEquipment.status_level})
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="#888" variant="caption">Operating Hours</Typography>
                    <Typography color="#fff">{selectedEquipment.operating_hours}h</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="#888" variant="caption">Temperature</Typography>
                    <Typography color={selectedEquipment.temperature > 70 ? '#ff6b6b' : '#fff'}>
                      {selectedEquipment.temperature || 0}°C
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="#888" variant="caption">Vibration</Typography>
                    <Typography color={selectedEquipment.vibration > 5 ? '#ff6b6b' : '#fff'}>
                      {selectedEquipment.vibration || 0} mm/s
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="#888" variant="caption">Power Consumption</Typography>
                    <Typography color="#fff">{selectedEquipment.power_consumption || 0} kW</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="#888" variant="caption">Availability</Typography>
                    <Typography color="#00ff88">{selectedEquipment.availability || 0}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="#888" variant="caption">OEE Score</Typography>
                    <Typography color="#33ff99">{selectedEquipment.oee_score || 0}%</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 2 }} />
                    <Typography color="#888" variant="caption">Alerts</Typography>
                    {selectedEquipment.alerts?.map((alert: string, idx: number) => (
                      <Alert key={idx} severity="warning" sx={{ mt: 1, bgcolor: 'rgba(255,170,51,0.05)' }}>
                        {alert}
                      </Alert>
                    ))}
                    <Typography color="#ffaa33" sx={{ mt: 1 }}>
                      Recommendation: {selectedEquipment.recommendation}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 2 }} />
                    <Typography color="#888" variant="caption">Maintenance Schedule</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography color="#888">Last: {selectedEquipment.last_maintenance ? new Date(selectedEquipment.last_maintenance).toLocaleDateString() : 'Never'}</Typography>
                      <Typography color="#ffaa33">Next: {selectedEquipment.next_maintenance ? new Date(selectedEquipment.next_maintenance).toLocaleDateString() : 'Not scheduled'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)} sx={{ color: '#888' }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Health Report Dialog */}
        <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: '#0a0a0a', color: '#fff', border: '1px solid rgba(0,204,102,0.2)' } }}>
          <DialogTitle sx={{ color: '#00cc66' }}>
            📋 Equipment Health Report
            <Button size="small" sx={{ ml: 2, color: '#00cc66' }}>Print</Button>
          </DialogTitle>
          <DialogContent>
            {report && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: '#00ff88' }}>Summary</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mt: 1 }}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography color="#888">Total Equipment</Typography>
                        <Typography color="#fff">{report.summary.total_equipment}</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography color="#888">Operational</Typography>
                        <Typography color="#00ff88">{report.summary.operational_count}</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography color="#888">Utilization</Typography>
                        <Typography color="#00cc66">{report.summary.utilization_rate}%</Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: '#00ff88', mt: 2 }}>Performance Metrics</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mt: 1 }}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography color="#888">Avg Operating Hours</Typography>
                        <Typography color="#fff">{report.metrics.avg_operating_hours}h</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography color="#888">Avg Health Score</Typography>
                        <Typography color="#33ff99">{report.metrics.avg_health_score}%</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Typography color="#888">Overall Availability</Typography>
                        <Typography color="#ffaa33">{report.metrics.overall_availability}%</Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: '#00ff88', mt: 2 }}>Equipment by Type</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: '#888' }}>Type</TableCell>
                            <TableCell sx={{ color: '#888' }}>Total</TableCell>
                            <TableCell sx={{ color: '#888' }}>Operational</TableCell>
                            <TableCell sx={{ color: '#888' }}>Maintenance</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(report.by_type || {}).map(([type, data]: [string, any]) => (
                            <TableRow key={type}>
                              <TableCell sx={{ color: '#fff' }}>{type}</TableCell>
                              <TableCell sx={{ color: '#aaa' }}>{data.total}</TableCell>
                              <TableCell sx={{ color: '#00ff88' }}>{data.operational}</TableCell>
                              <TableCell sx={{ color: '#ffaa33' }}>{data.maintenance}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: '#ff6b6b', mt: 2 }}>Critical Equipment</Typography>
                    {report.critical_equipment?.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ color: '#888' }}>Equipment</TableCell>
                              <TableCell sx={{ color: '#888' }}>Operating Hours</TableCell>
                              <TableCell sx={{ color: '#888' }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {report.critical_equipment.map((eq: any) => (
                              <TableRow key={eq.equipment_id}>
                                <TableCell sx={{ color: '#fff' }}>{eq.name}</TableCell>
                                <TableCell sx={{ color: '#ff6b6b' }}>{eq.operating_hours}h</TableCell>
                                <TableCell><Chip label={eq.status} size="small" color="error" /></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="#888" sx={{ mt: 1 }}>No critical equipment</Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography color="#888" variant="caption" sx={{ mt: 2, display: 'block' }}>
                      Report Generated: {new Date(report.timestamp).toLocaleString()}
                    </Typography>
                    <Typography color="#888" variant="caption" sx={{ display: 'block' }}>
                      Standards: SEMI E10, SEMI E79, ISO 9001, ISO 55001, ISA-95
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReportOpen(false)} sx={{ color: '#888' }}>Close</Button>
            <Button sx={{ color: '#00cc66' }}>Export PDF</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default EquipmentHealth;
