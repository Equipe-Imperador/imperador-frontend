import { useState, useEffect, useRef } from 'react';
import PitCallButton from '../components/PitCallButton';
import { useAuth } from '../context/AuthContext';
import { useTelemetryData } from '../hooks/useTelemetryData';
import GaugeComponent from '../components/GaugeComponent';
import AlertsPanel from '../components/AlertsPanel';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import DatePicker from 'react-datepicker';
import { Link } from 'react-router-dom';
import { styles, sensorConfig, presets } from '../config/dashboardConfig';
import { Box, Button, Typography } from '@mui/material';
import logo from '../assets/logo.png';

export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const { latestData, historicalData, fetchHistory, isLoading } = useTelemetryData();
  const [visibleSensors, setVisibleSensors] = useState<string[]>(presets.powertrain);
  const [isRealtime, setIsRealtime] = useState(false);
  const realtimeIntervalRef = useRef<number | null>(null);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  useEffect(() => {
    if (role === "juiz") setIsRealtime(false);
  }, [role]);

  useEffect(() => {
    if (isRealtime) {
      const id = window.setInterval(() => {
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        setStartDate(tenMinutesAgo);
        setEndDate(now);
        fetchHistory(tenMinutesAgo, now);
      }, 5000);
      realtimeIntervalRef.current = id;
      return () => {
        if (realtimeIntervalRef.current) window.clearInterval(realtimeIntervalRef.current);
      };
    }
  }, [isRealtime, fetchHistory]);

  useEffect(() => {
    // SÓ adiciona ao array de gráficos se o dado NÃO for velho
    if (!latestData || !latestData.time || latestData.isOld) return;

    setRealtimeData(prev => {
      const MAX = 300;
      const updated = [...prev, latestData];
      return updated.slice(-MAX);
    });
  }, [latestData]);

  const handleSensorToggle = (sensorId: string) => {
    setVisibleSensors(prev =>
      prev.includes(sensorId) ? prev.filter(id => id !== sensorId) : [...prev, sensorId]
    );
  };

  const handlePresetChange = (presetName: string) => {
    if (presets[presetName]) {
      setVisibleSensors(presets[presetName]);
      setIsRealtime(true);
    }
  };

  const handleFetchDataByDate = () => {
    if (isRealtime) setIsRealtime(false);
    if (role === 'juiz') return;
    fetchHistory(startDate, endDate);
  };

  const widgetsToShow = sensorConfig.filter(s => visibleSensors.includes(s.id));

  const renderContent = () => {
    if (!widgetsToShow || widgetsToShow.length === 0) {
      return <Typography sx={{ color: "#ccc", textAlign: "center", mt: 4 }}>Nenhum sensor selecionado.</Typography>;
    }

    const chartData = isRealtime ? realtimeData : historicalData;

    return (
      <>
        <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Mostradores</Typography>
        <Box sx={styles.widgetsContainer}>
          {widgetsToShow.map(widget => (
            <GaugeComponent
              key={widget.id + '-gauge'}
              label={widget.label}
              value={latestData?.[widget.id] as number ?? 0}
              unit={widget.unit}
              maxValue={widget.maxValue || 100}
              isOld={latestData?.isOld} // Passa o status de conexão
            />
          ))}
        </Box>

        <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#ccc' }}>
          {isRealtime ? "Gráficos em Tempo Real" : "Gráficos Históricos"}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {widgetsToShow.map((chart, index) => {
            const isLastChart = index === widgetsToShow.length - 1;
            return (
              <Box key={chart.id + '-graph'} sx={{ width: '100%', height: isLastChart ? 220 : 200, mb: 2 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} syncId="telemetrySync">
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(t) => new Date(t).toLocaleTimeString()} 
                      stroke="#ccc" 
                      hide={!isLastChart}
                    />
                    <YAxis stroke="#ccc" domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#222', color: '#ccc' }} />
                    <Legend wrapperStyle={{ color: '#ccc' }} />
                    <Line 
                      type="monotone" 
                      dataKey={chart.id} 
                      name={chart.label} 
                      stroke={chart.color} 
                      dot={false} 
                      isAnimationActive={false} 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            );
          })}
        </Box>
      </>
    );
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: '#131E33' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#131E33', backgroundImage: `url(${logo})`, backgroundSize: '90%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center top 200px', filter: 'blur(3px)', opacity: 0.2, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' }}>
        <aside style={{ ...styles.sidebar, color: '#ccc' }}>
          <Typography variant="h6">Controles</Typography>
          {role === 'integrante' && (
            <>
              <PitCallButton />
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Período</Typography>
              <DatePicker selected={startDate} onChange={(d) => d && setStartDate(d)} showTimeSelect dateFormat="dd/MM/yyyy HH:mm" customInput={<input style={styles.datePickerInput} />} />
              <DatePicker selected={endDate} onChange={(d) => d && setEndDate(d)} showTimeSelect dateFormat="dd/MM/yyyy HH:mm" customInput={<input style={styles.datePickerInput} />} />
              <Button fullWidth variant="outlined" onClick={handleFetchDataByDate} sx={{ mt: 1, color: '#ccc', borderColor: '#ccc' }}>Buscar</Button>
              <Button fullWidth variant="outlined" onClick={() => setIsRealtime(true)} sx={{ mt: 1, color: '#ccc', borderColor: '#ccc' }}>Tempo Real</Button>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Presets</Typography>
              {['powertrain', 'freios', 'suspensao', 'todos'].map(p => (
                <Button key={p} fullWidth variant="outlined" onClick={() => handlePresetChange(p)} sx={{ mt: 0.5, color: '#ccc', borderColor: '#ccc' }}>{p}</Button>
              ))}
            </>
          )}
        </aside>
        <div style={styles.mainContent}>
          <header style={styles.header}>
            <Typography variant="h4">Dashboard Imperador</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography>{user?.email}</Typography>
              <Button variant="outlined" color="error" onClick={logout}>Sair</Button>
            </Box>
          </header>
          <main>
            <AlertsPanel data={latestData} />
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}