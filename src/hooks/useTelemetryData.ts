import { useState, useEffect, useRef } from "react";
import { getHistoricalTelemetry } from "../services/telemetryService";
import { useAuth } from "../context/AuthContext";

export interface TelemetryData {
  time: string;
  [key: string]: any;
}

export const useTelemetryData = () => {
  const [latestData, setLatestData] = useState<Partial<TelemetryData>>({});
  const [historicalData, setHistoricalData] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  
  const wsRef = useRef<WebSocket | null>(null);

  // --------- Histórico ---------
  const fetchHistory = async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true);
      const data = await getHistoricalTelemetry(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setHistoricalData(data);
    } catch (err: any) {
      if (err.response?.status === 401) logout();
      setError("Erro ao carregar histórico.");
    } finally {
      setIsLoading(false);
    }
  };

  // --------- WebSocket em tempo real ---------
  useEffect(() => {
    const connectWS = () => {
      wsRef.current = new WebSocket("ws://72.60.141.159:3000");

      wsRef.current.onopen = () => {
        console.log("🔗 WebSocket conectado.");
      };

      wsRef.current.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          setLatestData(data);
        } catch (err) {
          console.error("Erro WS:", err);
        }
      };

      wsRef.current.onclose = () => {
        console.warn("WS desconectado — tentando reconectar...");
        setTimeout(connectWS, 2000);
      };

      wsRef.current.onerror = () => {
        wsRef.current?.close();
      };
    };

    connectWS();

    return () => wsRef.current?.close();
  }, []);

  return { latestData, historicalData, isLoading, error, fetchHistory };
};
