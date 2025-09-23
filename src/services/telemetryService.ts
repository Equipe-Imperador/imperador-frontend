import axios from 'axios';

// A URL base da nossa API na VPS
const API_BASE_URL = 'http://72.60.141.159:3000/api';

// Criamos uma instância do Axios para não repetir a URL e os cabeçalhos
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Esta função adiciona o token JWT a cada requisição
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Função para buscar o último dado de telemetria
export const getLatestTelemetry = async () => {
  const response = await apiClient.get('/telemetry/latest');
  return response.data;
};

// Função para buscar dados históricos de telemetria entre duas datas
export const getHistoricalTelemetry = async (startDate: string, endDate: string) => {
  const response = await apiClient.get('/telemetry/history', {
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
};