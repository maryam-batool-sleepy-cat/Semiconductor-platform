import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Dashboard
export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
};

// Wafer Production
export const waferService = {
  getBatches: () => api.get('/wafers/batches'),
  createBatch: (data: any) => api.post('/wafers/batches', data),
  getBatchHistory: (batchId: number) => api.get(`/wafers/batches/${batchId}/history`),
  updateWaferStage: (waferId: string, stage: string) => 
    api.patch(`/wafers/wafers/${waferId}/stage`, { stage }),
};

// Equipment
export const equipmentService = {
  getEquipment: () => api.get('/equipment'),
  registerEquipment: (data: any) => api.post('/equipment', data),
  getEquipmentHealth: (equipmentId: string) => 
    api.get(`/equipment/${equipmentId}/health`),
  updateUtilization: (equipmentId: string, hours: number) =>
    api.post(`/equipment/${equipmentId}/utilization`, { hours }),
};

// Maintenance
export const maintenanceService = {
  scheduleMaintenance: (data: any) => api.post('/maintenance', data),
  getPredictions: () => api.get('/maintenance/predictions'),
  getAlerts: () => api.get('/maintenance/alerts'),
};

// Yield
export const yieldService = {
  recordYield: (data: any) => api.post('/yield', data),
  getTrends: (days?: number) => api.get('/yield/analytics/trends', { params: { days } }),
  getQualityReport: () => api.get('/yield/quality/report'),
};

export default api;
