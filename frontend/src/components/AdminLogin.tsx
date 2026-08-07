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

const AdminLogin: React.FC = () => {
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
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('username', username);
      setError('');
      setShowWelcome(true);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
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
          background: '#2a2a2a',
          border: '1px solid rgba(0,255,136,0.2)',
          borderRadius: 2,
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminPanelSettings sx={{ fontSize: 48, color: '#00ff88', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
              Admin Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
              Enter your administrator credentials
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
            startIcon={<AdminPanelSettings />}
            onClick={handleLogin}
            sx={{
              bgcolor: '#00ff88',
              color: '#000000',
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#00cc66' },
            }}
          >
            Admin Sign In
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ color: '#888', '&:hover': { color: '#00ff88' } }}
            >
              Employee Login →
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Admin Welcome Dialog */}
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
        <DialogTitle sx={{ color: '#00ff88' }}>
          👋 Welcome Admin
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#aaaaaa', lineHeight: 1.8 }}>
            You have successfully logged in to the Semiconductor Manufacturing Operations Platform.
            <br /><br />
            • 👑 Access to executive dashboards<br />
            • 📊 View all KPIs and reports<br />
            • ⚙️ Full system management capabilities
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWelcomeClose} sx={{ color: '#00ff88' }}>
            Continue to Admin Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLogin;
