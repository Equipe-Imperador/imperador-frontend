import { useState, useEffect, useCallback } from 'react';
import { getHistoricalTelemetry, getLatestTelemetry } from '../services/telemetryService';
import { useAuth } from '../context/AuthContext'; // Importa o hook de autenticação

export interface TelemetryData {
  time: string;
  [key: string]: any;
}

export const useTelemetryData = () => {
  const [latestData, setLatestData] = useState<Partial<TelemetryData>>({});
  const [historicalData, setHistoricalData] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth(); // Pega a função logout de dentro do hook

  const fetchHistory = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHistoricalTelemetry(startDate.toISOString(), endDate.toISOString());
      setHistoricalData(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça o login novamente.");
        logout(); // Faz o logout se o token estiver inválido
      } else {
        setError("Não foi possível carregar o histórico.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // O polling para dados em tempo real
    const intervalId = setInterval(async () => {
      try {
        const data = await getLatestTelemetry();
        setLatestData(data);
      } catch (err) {
        console.error("Erro na busca em tempo real:", err);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return { latestData, historicalData, isLoading, error, fetchHistory };
};