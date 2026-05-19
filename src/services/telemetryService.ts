import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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