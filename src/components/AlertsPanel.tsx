// src/components/AlertsPanel.tsx
import { useEffect, useState } from 'react';
import type { TelemetryData } from '../hooks/useTelemetryData';

interface Alert {
  message: string;
  level: 'warning' | 'critical';
  timestamp: number; // adicionamos horário
}

interface AlertsPanelProps {
  data: Partial<TelemetryData> | null;
}

const alertStyles = {
  warning: { backgroundColor: '#444029', color: '#ffc107', borderLeft: '4px solid #ffc107' },
  critical: { backgroundColor: '#422f31', color: '#f44336', borderLeft: '4px solid #f44336' },
  panel: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  alert: { padding: '0.5rem 1rem', borderRadius: '4px' },
};

export default function AlertsPanel({ data }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!data) return;

    const newAlerts: Alert[] = [];
    const now = Date.now();

    // --- Regras de alerta ---
    if (data.temp_cvt) {
      if (data.temp_cvt > 90)
        newAlerts.push({
          level: 'critical',
          message: `Temp. CVT CRÍTICA: ${data.temp_cvt.toFixed(1)}°C`,
          timestamp: now,
        });
      else if (data.temp_cvt > 80)
        newAlerts.push({
          level: 'warning',
          message: `Temp. CVT alta: ${data.temp_cvt.toFixed(1)}°C`,
          timestamp: now,
        });
    }

    if (data.tensao_bateria && data.tensao_bateria < 9.0) {
      newAlerts.push({
        level: 'warning',
        message: `Tensão da Bateria baixa: ${data.tensao_bateria.toFixed(1)}V`,
        timestamp: now,
      });
    }

    // Se houver novos alertas, adiciona ao histórico
    if (newAlerts.length > 0) {
      setAlerts((prev) => [
        ...prev,
        ...newAlerts.filter(
          (n) => !prev.some((p) => p.message === n.message && p.level === n.level)
        ),
      ]);
    }
  }, [data]);

  // Limpa alertas antigos (mais de 15 min)
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - 15 * 60 * 1000;
      setAlerts((prev) => prev.filter((a) => a.timestamp >= cutoff));
    }, 60 * 1000); // checa a cada 1 min
    return () => clearInterval(interval);
  }, []);

  const recentAlerts = alerts.filter(
    (a) => a.timestamp >= Date.now() - 15 * 60 * 1000
  );

  return (
    <div style={alertStyles.panel}>
      {recentAlerts.length === 0 ? (
        <p style={{ color: 'gray' }}>Nenhum alerta nos últimos 15 minutos.</p>
      ) : (
        recentAlerts.map((alert, index) => (
          <div key={index} style={{ ...alertStyles.alert, ...alertStyles[alert.level] }}>
            <strong>{alert.level.toUpperCase()}:</strong> {alert.message}
          </div>
        ))
      )}
    </div>
  );
}
