import { useState, useEffect, useCallback } from 'react';
import { getHistoricalTelemetry, getLatestTelemetry } from '../services/telemetryService';
import { useAuth } from '../context/AuthContext';

export interface TelemetryData {
  time: string;
  isOld?: boolean;
  [key: string]: any;
}

export const useTelemetryData = () => {
  const [latestData, setLatestData] = useState<Partial<TelemetryData>>({});
  const [historicalData, setHistoricalData] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const fetchHistory = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true);
      const data = await getHistoricalTelemetry(startDate.toISOString(), endDate.toISOString());
      setHistoricalData(data);
    } catch (err: any) {
      if (err.response?.status === 401) logout();
      setError("Erro ao carregar histórico.");
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const data = await getLatestTelemetry();
        setLatestData(data);
        
        // SÓ adiciona ao gráfico se o dado não for velho
        if (data && !data.isOld) {
          setHistoricalData(prev => {
            const lastPoint = prev[prev.length - 1];
            // Evita duplicatas se o polling for mais rápido que o banco
            if (lastPoint && lastPoint.time === data.time) return prev;
            return [...prev.slice(-50), data]; // Mantém 50 pontos
          });
        }
      } catch (err) {
        console.error("Erro real-time:", err);
      } finally {
        setIsLoading(false);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return { latestData, historicalData, isLoading, error, fetchHistory };
};