import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Factory,
  Speed,
  Assessment,
  Warning,
} from '@mui/icons-material';

interface NavigationProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // Session timeout check (30 minutes)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoggedIn) {
      timer = setTimeout(() => {
        setSessionTimeout(true);
        handleLogout();
      }, 30 * 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Wafer Production', icon: <Factory />, path: '/wafer-production' },
    { label: 'Equipment Health', icon: <Speed />, path: '/equipment-health' },
    { label: 'Yield Analytics', icon: <Assessment />, path: '/yield-analytics' },
    { label: 'Maintenance', icon: <Warning />, path: '/maintenance' },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    handleMenuClose();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" sx={{
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow: 'none',
        zIndex: 1,
      }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: '#00ff88',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            onClick={() => navigate('/dashboard')}
          >
            🏭 NanoChip Manufacturing
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path ? '#00ff88' : '#ffffff',
                  backgroundColor: location.pathname === item.path ? 'rgba(0,255,136,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(0,255,136,0.05)' },
                  textTransform: 'none',
                  fontSize: '13px',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              >
                {item.icon}
                <Typography sx={{ ml: 1 }}>{item.label}</Typography>
              </Button>
            ))}
          </Box>

          {/* Show Admin button only if user is admin */}
          {isAdmin && (
            <Button
              onClick={() => navigate('/admin-dashboard')}
              sx={{
                color: '#00ff88',
                borderColor: '#00ff88',
                mr: 1,
                '&:hover': {
                  backgroundColor: 'rgba(0,255,136,0.05)',
                },
              }}
            >
              <AdminIcon sx={{ mr: 0.5 }} />
              Admin Panel
            </Button>
          )}

          <IconButton
            onClick={handleMenuOpen}
            sx={{
              color: '#ffffff',
              bgcolor: '#2a2a2a',
              '&:hover': { bgcolor: '#3a3a3a' },
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
              {localStorage.getItem('username') || 'User'}
            </Typography>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                bgcolor: '#2a2a2a',
                color: '#ffffff',
                mt: 1,
                minWidth: 150,
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          >
            <MenuItem onClick={handleLogout} sx={{ color: '#ffffff' }}>
              <LogoutIcon sx={{ mr: 1, color: '#ff6b6b' }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Session Timeout Alert */}
      <Snackbar
        open={sessionTimeout}
        autoHideDuration={6000}
        onClose={() => setSessionTimeout(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" sx={{ bgcolor: '#1a1a1a', color: '#ffaa33' }}>
          Session timed out. Please login again.
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navigation;
