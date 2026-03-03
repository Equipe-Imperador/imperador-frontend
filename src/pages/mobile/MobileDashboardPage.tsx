import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetryData } from '../../hooks/useTelemetryData';
import GaugeComponent from '../../components/GaugeComponent';
import AlertsPanel from '../../components/AlertsPanel';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { sensorConfig, presets } from '../../config/dashboardConfig';
import { Box, Button, Typography } from '@mui/material';
import PitCallButton from '../../components/PitCallButton';

export default function MobileDashboardPage() {
  const { user, logout } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();
  const { latestData, historicalData, fetchHistory } = useTelemetryData();
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [visibleSensors, setVisibleSensors] = useState<string[]>(presets.powertrain);
  const [showCharts, setShowCharts] = useState(false);
  const [isRealtime, setIsRealtime] = useState(false);

  useEffect(() => {
    if (isRealtime) {
      const id = window.setInterval(() => {
        const now = new Date();
        fetchHistory(new Date(now.getTime() - 3 * 60 * 1000), now);
      }, 5000);
      return () => window.clearInterval(id);
    }
  }, [isRealtime, fetchHistory]);

  useEffect(() => {
    // Filtra dados velhos para não poluir o gráfico
    if (!latestData || !latestData.time || latestData.isOld) return;
    setRealtimeData(prev => [...prev.slice(-100), latestData]);
  }, [latestData]);

  const widgetsToShow = sensorConfig.filter(s => visibleSensors.includes(s.id));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#131E33', color: '#ccc', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Imperador Mobile</Typography>
        <Button variant="outlined" color="error" size="small" onClick={logout}>Sair</Button>
      </Box>

      <Box sx={{ bgcolor: 'rgba(0,20,47,0.75)', p: 2, borderRadius: 2, mb: 2 }}>
        <PitCallButton />
        <Button fullWidth variant="outlined" onClick={() => setIsRealtime(!isRealtime)} sx={{ mt: 1, color: isRealtime ? '#39c21d' : '#ccc' }}>
          {isRealtime ? "Tempo Real Ativo" : "Ativar Tempo Real"}
        </Button>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => setVisibleSensors(presets.powertrain)} sx={{ color: '#ccc' }}>Motor</Button>
          <Button fullWidth variant="outlined" onClick={() => setVisibleSensors(presets.freios)} sx={{ color: '#ccc' }}>Freios</Button>
        </Box>
      </Box>

      <AlertsPanel data={latestData} />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
        {widgetsToShow.map((widget) => (
          <Box key={widget.id} sx={{ bgcolor: '#0b1a2a', p: 1, borderRadius: 2, display: 'flex', justifyContent: 'center' }}>
            <GaugeComponent
              label={widget.label}
              value={latestData?.[widget.id] as number ?? 0}
              unit={widget.unit}
              isOld={latestData?.isOld} // Garante o feedback visual de offline
            />
          </Box>
        ))}
      </Box>

      <Button fullWidth variant="contained" onClick={() => setShowCharts(!showCharts)} sx={{ mb: 2 }}>
        {showCharts ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
      </Button>

      {showCharts && widgetsToShow.map((chart) => (
        <Box key={chart.id} sx={{ height: 180, mb: 2, bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 2 }}>
          <ResponsiveContainer>
            <LineChart data={isRealtime ? realtimeData : historicalData}>
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="#888" fontSize={10} />
              <YAxis stroke="#888" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#222' }} />
              <Line type="monotone" dataKey={chart.id} stroke={chart.color} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ))}
    </Box>
  );
}