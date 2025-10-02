
import type { TelemetryData } from '../hooks/useTelemetryData'; // Importa a interface

interface Alert {
  message: string;
  level: 'warning' | 'critical';
}

interface AlertsPanelProps {
  data: Partial<TelemetryData> | null;
}

// A CORREÇÃO ESTÁ AQUI: Removemos a anotação de tipo explícita
const alertStyles = {
  warning: { backgroundColor: '#444029', color: '#ffc107', borderLeft: '4px solid #ffc107' },
  critical: { backgroundColor: '#422f31', color: '#f44336', borderLeft: '4px solid #f44336' },
  panel: { display: 'flex', flexDirection: 'column' as 'column', gap: '0.5rem' }, // Adicionamos 'as 'column'' para garantir o tipo
  alert: { padding: '0.5rem 1rem', borderRadius: '4px' }
};

const AlertsPanel = ({ data }: AlertsPanelProps) => {
  const alerts: Alert[] = [];

  // --- REGRAS DE ALERTA ---
  if (data) {
    if (data.temp_cvt && data.temp_cvt > 90) {
      alerts.push({ level: 'critical', message: `Temp. CVT CRÍTICA: ${data.temp_cvt.toFixed(1)}°C` });
    } else if (data.temp_cvt && data.temp_cvt > 80) {
      alerts.push({ level: 'warning', message: `Aviso: Temp. CVT alta: ${data.temp_cvt.toFixed(1)}°C` });
    }

    if (data.tensao_bateria && data.tensao_bateria < 9.0) {
      alerts.push({ level: 'warning', message: `Aviso: Tensão da Bateria baixa: ${data.tensao_bateria.toFixed(1)}V` });
    }
  }

  return (
    <div style={alertStyles.panel}>
      {alerts.length === 0 ? (
        <p style={{ color: 'gray' }}>Nenhum alerta no momento.</p>
      ) : (
        alerts.map((alert, index) => (
          <div key={index} style={{ ...alertStyles.alert, ...alertStyles[alert.level] }}>
            <strong>{alert.level.toUpperCase()}:</strong> {alert.message}
          </div>
        ))
      )}
    </div>
  );
};

export default AlertsPanel;