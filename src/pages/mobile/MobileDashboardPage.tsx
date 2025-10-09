import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetryData } from '../../hooks/useTelemetryData';
import { sendPitCallCommand } from '../../services/telemetryService';
import GaugeComponent from '../../components/GaugeComponent';
import AlertsPanel from '../../components/AlertsPanel';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { sensorConfig, presets } from '../../config/dashboardConfig';
import { Box, Button, Typography } from '@mui/material';

export default function MobileDashboardPage() {
  const { user, logout } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const { latestData, historicalData, fetchHistory } = useTelemetryData();

  const [visibleSensors, setVisibleSensors] = useState<string[]>(presets.powertrain);
  const [showCharts, setShowCharts] = useState(false); // ✅ novo estado

  useEffect(() => {
    if (role === 'juiz') {
      const now = new Date();
      setStartDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      setEndDate(now);
      fetchHistory(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
    } else {
      fetchHistory(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchHistory, role]);

  const handleSensorToggle = (sensorId: string) => {
    setVisibleSensors(prev =>
      prev.includes(sensorId) ? prev.filter(id => id !== sensorId) : [...prev, sensorId]
    );
  };

  const handlePresetChange = (presetName: string) => {
    if (presets[presetName]) setVisibleSensors(presets[presetName]);
  };

  const handleFetchDataByDate = () => {
    if (role === 'juiz') return;
    fetchHistory(startDate, endDate);
  };

  const handleLast10Minutes = () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    setStartDate(tenMinutesAgo);
    setEndDate(now);
    fetchHistory(tenMinutesAgo, now);
  };

  const handlePitCall = async () => {
    try {
      const response = await sendPitCallCommand();
      alert(response.message);
    } catch (err) {
      alert('Erro ao enviar comando para o box.');
      console.error(err);
    }
  };

  const widgetsToShow = sensorConfig.filter(s => visibleSensors.includes(s.id));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#131E33', color: '#ccc', p: 2 }}>
      {/* Topo */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Dashboard Imperador</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
         
          <Typography sx={{ fontSize: 15 }}>{user?.email}</Typography>
          <Button variant="outlined" color="error" onClick={logout}>
            Sair
          </Button>
        </Box>
      </Box>

      {/* CONTROLES */}
      <Box sx={{ bgcolor: 'rgba(0,20,47,0.75)', p: 2, borderRadius: 2, gap:2, mb: 2 }}>
        {role === 'integrante' && (
          <>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mb:1,color: '#0faf2aff', borderColor: '#39c21d7a' }}
              onClick={() => navigate('/mobile/export')}
            >
              Exportar
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handlePitCall}
              sx={{ mb: 1, color: '#ccc', borderColor: '#ccc' }}
            >
              Chamar para o Box
            </Button>

            {/* Date pickers */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
              <label style={{ color: '#ccc', fontSize: 12 }}>Início</label>
              <input
                type="datetime-local"
                value={startDate.toISOString().slice(0, 16)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid #444',
                  background: '#0b1a2a',
                  color: '#fff',
                }}
              />
              <label style={{ color: '#ccc', fontSize: 12 }}>Fim</label>
              <input
                type="datetime-local"
                value={endDate.toISOString().slice(0, 16)}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid #444',
                  background: '#0b1a2a',
                  color: '#fff',
                }}
              />

              <Button
                fullWidth
                variant="outlined"
                onClick={handleFetchDataByDate}
                sx={{ color: '#ccc', borderColor: '#ccc' }}
              >
                Buscar Período
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleLast10Minutes}
                sx={{ color: '#ccc', borderColor: '#ccc' }}
              >
                Últimos 10 Minutos
              </Button>
            </Box>

            {/* Presets */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handlePresetChange('powertrain')}
                sx={{ color: '#ccc', borderColor: '#ccc' }}
              >
                Powertrain
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handlePresetChange('freios')}
                sx={{ color: '#ccc', borderColor: '#ccc' }}
              >
                Freios
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handlePresetChange('suspensao')}
                sx={{ color: '#ccc', borderColor: '#ccc' }}
              >
                Suspensão
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handlePresetChange('todos')}
                sx={{ color: '#ccc', borderColor: '#ccc' }}
              >
                Todos
              </Button>
            </Box>
            
          </>
        )}

        {/* Sensores */}
        <Typography sx={{ mb: 1 }}>Sensores</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {sensorConfig.map((sensor) => (
            <Button
              key={sensor.id}
              variant={visibleSensors.includes(sensor.id) ? 'contained' : 'outlined'}
              onClick={() => handleSensorToggle(sensor.id)}
              sx={{
                bgcolor: visibleSensors.includes(sensor.id) ? '#00142F' : 'transparent',
                color: '#ccc',
                borderColor: '#444',
                fontSize: 12,
              }}
            >
              {sensor.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* ALERTAS */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ mb: 1 }}>Alertas</Typography>
        <AlertsPanel data={latestData} />
      </Box>

      {/* BOTÃO ON/OFF GRÁFICOS */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowCharts(!showCharts)}
          sx={{
            bgcolor: showCharts ? '#8d0a0aff' : '#004080',
            color: '#fff',
            '&:hover': { bgcolor: showCharts ? '#8d0a0aff' : '#004080' },
          }}
        >
          {showCharts ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
        </Button>
      </Box>

      {/* GAUGES - agora em 2 colunas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 0,
          mb: 2,
        }}
      >
        {widgetsToShow.map((widget) => (
          <Box
            key={widget.id}
            sx={{
              bgcolor: '#0b1a2a',
              borderRadius: 2,
              p: 1,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <GaugeComponent
              label={widget.label}
              value={latestData?.[widget.id] as number ?? 0}
              unit={widget.unit}
              maxValue={widget.maxValue || 100}
            />
          </Box>
        ))}
      </Box>

      {/* GRÁFICOS - mostrados apenas se showCharts estiver ativo */}
      {showCharts && (
        <Box>
          <Typography sx={{ mb: 1 }}>Gráficos</Typography>
          {widgetsToShow.map((chart, idx) => (
            <Box
              key={chart.id}
              sx={{
                width: 'auto',
                height: idx === widgetsToShow.length - 1 ? 220 : 180,
                mb: 2,
              }}
            >
              <ResponsiveContainer>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                    stroke="#ccc"
                  />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#222', color: '#ccc' }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={chart.id}
                    stroke={chart.color}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
