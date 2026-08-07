import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Factory,
  Speed,
  Assessment,
  Warning,
  AdminPanelSettings,
  Login as LoginIcon,
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 1,
    }}>
      {/* Faint pattern background */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,255,136,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper sx={{
          p: 5,
          background: 'rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 2,
        }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Factory sx={{ fontSize: 64, color: '#00ff88', mb: 2 }} />
            <Typography variant="h3" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
              NanoChip Manufacturing
            </Typography>
            <Typography variant="h6" sx={{ color: '#888', mt: 1 }}>
              Semiconductor Manufacturing Operations Platform
            </Typography>
          </Box>

          {/* Description */}
          <Typography variant="body1" sx={{ color: '#aaaaaa', textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 4, lineHeight: 1.8 }}>
            Welcome to the NanoChip Semiconductor Manufacturing Operations Platform.
            This system provides real-time monitoring and management of wafer production,
            equipment health, yield analytics, and maintenance operations.
          </Typography>

          {/* Features Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { title: 'Wafer Production', icon: <Factory />, desc: 'Track wafer batches and production stages', color: '#00ff88' },
              { title: 'Equipment Health', icon: <Speed />, desc: 'Monitor all fabrication equipment', color: '#00cc66' },
              { title: 'Yield Analytics', icon: <Assessment />, desc: 'Analyse yield and defect rates', color: '#33ff99' },
              { title: 'Maintenance', icon: <Warning />, desc: 'Predictive maintenance scheduling', color: '#ffaa33' },
            ].map((feature) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Card sx={{
                  background: 'rgba(0,0,0,0.6)',
                  border: `1px solid ${feature.color}20`,
                  height: '100%',
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: feature.color, fontSize: 40, mb: 1 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Login Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#00ff88',
                color: '#000000',
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#00cc66' },
                minWidth: 200,
              }}
            >
              Employee Login
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<AdminPanelSettings />}
              onClick={() => navigate('/admin-login')}
              sx={{
                color: '#00ff88',
                borderColor: '#00ff88',
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#00cc66',
                  backgroundColor: 'rgba(0,255,136,0.05)',
                },
                minWidth: 200,
              }}
            >
              Admin Login
            </Button>
          </Box>

          <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 3, textAlign: 'center' }}>
            © 2026 NanoChip Semiconductor Corporation
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;
