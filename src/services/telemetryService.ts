import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://72.60.141.159:3000/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getLatestTelemetry = async () => {
  const response = await apiClient.get('/telemetry/latest');
  return response.data;
};

export const getHistoricalTelemetry = async (startDate: string, endDate: string) => {
  const response = await apiClient.get('/telemetry/history', {
    params: { startDate, endDate },
  });
  return response.data;
};


export const sendPitCallCommand = async () => {
  const response = await apiClient.post('/telemetry/pit-call');
  return response.data;
};