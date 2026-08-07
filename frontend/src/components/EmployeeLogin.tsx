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
} from '@mui/material';
import { Login as LoginIcon, Factory } from '@mui/icons-material';

const EmployeeLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // SQL injection prevention
    const sqlPattern = /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|--|;)/i;
    if (sqlPattern.test(username) || sqlPattern.test(password)) {
      setError('Invalid characters detected');
      return;
    }

    // Check for valid credentials
    if (username === 'employee' && password === 'employee123') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAdmin', 'false');
      localStorage.setItem('username', username);
      setError('');
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
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
            <Typography variant="h5" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
              Employee Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
              Enter your employee credentials to access the system
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,0,0,0.1)', color: '#ff6b6b' }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Employee ID / Username"
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
            startIcon={<LoginIcon />}
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

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => navigate('/admin-login')}
              sx={{ color: '#888', '&:hover': { color: '#00ff88' } }}
            >
              Admin Login →
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EmployeeLogin;
