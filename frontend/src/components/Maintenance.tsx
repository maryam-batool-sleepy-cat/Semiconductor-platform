import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Build,
  CheckCircle,
  Schedule,
  Add as AddIcon,
} from '@mui/icons-material';
import Navigation from './Navigation';
import { maintenanceService, equipmentService } from '../services/api';


export default Maintenance;
