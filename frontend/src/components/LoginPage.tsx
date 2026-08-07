import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AdminPanelSettings, Factory } from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  const handleLogin = () => {
    // SQL injection prevention
    const sqlPattern = /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|--|;)/i;
    if (sqlPattern.test(username) || sqlPattern.test(password)) {
      setError('Invalid characters detected');
      return;
    }
    
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
      setShowWelcome(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    // Redirect to admin dashboard directly
    navigate('/admin-dashboard');
  };

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
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper sx={{ 
          p: 5, 
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 2,
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Factory sx={{ fontSize: 48, color: '#00ff88', mb: 2 }} />
            <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
              NanoChip Manufacturing
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
              Semiconductor Manufacturing Operations Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,0,0,0.1)', color: '#ff6b6b' }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ 
              mb: 2,
              input: { color: '#ffffff' },
              label: { color: '#888' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            sx={{ 
              mb: 3,
              input: { color: '#ffffff' },
              label: { color: '#888' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
              bgcolor: '#00ff88',
              color: '#000000',
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#00cc66' },
            }}
          >
            Sign In
          </Button>

          <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 2, textAlign: 'center' }}>
            Secure Login • Session timeout: 30 minutes
          </Typography>
        </Paper>
      </Container>

      {/* Welcome Dialog - Auto shows on first login */}
      <Dialog 
        open={showWelcome} 
        onClose={handleWelcomeClose}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid rgba(0,255,136,0.2)',
            maxWidth: 500,
          }
        }}
      >
        <DialogTitle sx={{ color: '#00ff88', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          👋 Welcome to NanoChip Manufacturing
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#aaaaaa', lineHeight: 1.8 }}>
            You have successfully logged in to the Semiconductor Manufacturing Operations Platform.
            <br /><br />
            • 📊 Track wafer production and movement<br />
            • 🔧 Monitor equipment health and utilization<br />
            • 📈 Analyse yield and defect rates<br />
            • ⚠️ Manage maintenance schedules and alerts
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWelcomeClose} sx={{ color: '#00ff88' }}>
            Continue to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
