import { useState, useEffect, useRef } from 'react';
import PitCallButton from '../components/PitCallButton';
import { useAuth } from '../context/AuthContext';
import { useTelemetryData } from '../hooks/useTelemetryData';
import GaugeComponent from '../components/GaugeComponent';
import AlertsPanel from '../components/AlertsPanel';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import DatePicker from 'react-datepicker';
import { styles, sensorConfig, presets } from '../config/dashboardConfig';
import { Box, Button, Typography } from '@mui/material';
import logo from '../assets/logo.png';
import "react-datepicker/dist/react-datepicker.css";

export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const { latestData, historicalData, fetchHistory } = useTelemetryData();
  const [visibleSensors, setVisibleSensors] = useState<string[]>(presets.powertrain);
  const [isRealtime, setIsRealtime] = useState(true);
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
    if (!latestData || !latestData.time || latestData.isOld) return;

    setRealtimeData(prev => {
      const MAX = 300;
      const updated = [...prev, latestData];
      return updated.slice(-MAX);
    });
  }, [latestData]);

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

  const widgetsToShow = sensorConfig.filter((s: any) => visibleSensors.includes(s.id));

  const renderContent = () => {
    if (!widgetsToShow || widgetsToShow.length === 0) {
      return <Typography sx={{ color: "#ccc", textAlign: "center", mt: 4 }}>Nenhum sensor selecionado.</Typography>;
    }

    const chartData = isRealtime ? realtimeData : historicalData;

    return (
      <>
        <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#ccc', mb: 2 }}>Mostradores</Typography>
        <Box sx={styles.widgetsContainer}>
          {widgetsToShow.map((widget: any) => (
            <GaugeComponent
              key={widget.id + '-gauge'}
              label={widget.label}
              value={latestData?.[widget.id] as number ?? 0}
              unit={widget.unit}
              maxValue={widget.maxValue || 100}
              isOld={latestData?.isOld}
            />
          ))}
        </Box>

        <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#ccc', mt: 4, mb: 2 }}>
          {isRealtime ? "Gráficos em Tempo Real" : "Gráficos Históricos"}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {widgetsToShow.map((chart: any, index: number) => {
            const isLastChart = index === widgetsToShow.length - 1;
            return (
              <Box key={chart.id + '-graph'} sx={{ width: '100%', height: isLastChart ? 220 : 200, backgroundColor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 1 }}>
                <Typography sx={{ color: chart.color, fontSize: '0.9rem', mb: 1 }}>{chart.label}</Typography>
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
                    <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#ccc' }} />
                    <Legend wrapperStyle={{ color: '#ccc', fontSize: '0.8rem' }} />
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
    <div style={{ position: 'relative', minHeight: '100vh', color: '#ccc', backgroundColor: '#131E33' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundImage: `url(${logo})`, backgroundSize: '40%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'blur(3px)', opacity: 0.05, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' }}>
        <aside style={{ ...styles.sidebar, width: '260px', borderRight: '1px solid #333', padding: '20px' }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Controles</Typography>
          {role === 'integrante' && (
            <>
              <PitCallButton />
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Período Histórico</Typography>
              <DatePicker 
                selected={startDate} 
                onChange={(d) => d && setStartDate(d)} 
                showTimeSelect 
                dateFormat="dd/MM/yyyy HH:mm" 
                popperPlacement="bottom-start"
                customInput={<input style={{ ...styles.datePickerInput, width: '100%', marginBottom: '10px' }} />} 
              />
              <DatePicker 
                selected={endDate} 
                onChange={(d) => d && setEndDate(d)} 
                showTimeSelect 
                dateFormat="dd/MM/yyyy HH:mm" 
                popperPlacement="bottom-start"
                customInput={<input style={{ ...styles.datePickerInput, width: '100%' }} />} 
              />
              <Button fullWidth variant="contained" onClick={handleFetchDataByDate} sx={{ mt: 2, mb: 1, backgroundColor: '#222' }}>Buscar</Button>
              <Button fullWidth variant="outlined" onClick={() => setIsRealtime(true)} sx={{ mb: 4, color: '#FFD700', borderColor: '#FFD700' }}>Tempo Real</Button>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Presets</Typography>
              {['powertrain', 'freios', 'suspensao', 'todos'].map(p => (
                <Button key={p} fullWidth variant="outlined" onClick={() => handlePresetChange(p)} sx={{ mt: 0.5, color: '#ccc', borderColor: '#444' }}>{p}</Button>
              ))}
            </>
          )}
        </aside>
        <div style={{ ...styles.mainContent, flexGrow: 1, padding: '25px' }}>
          <header style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <Typography variant="h4">Dashboard Imperador</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">{user?.email}</Typography>
              <Button variant="outlined" color="error" size="small" onClick={logout}>Sair</Button>
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