import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTelemetryData } from '../hooks/useTelemetryData';
import { sendPitCallCommand } from '../services/telemetryService'; 
import GaugeComponent from '../components/GaugeComponent';
import AlertsPanel from '../components/AlertsPanel';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import DatePicker from 'react-datepicker'; 
import { Link } from 'react-router-dom';
import { styles, sensorConfig, presets } from '../config/dashboardConfig'; 
import { Box, Button, Typography } from '@mui/material';
import logo from '../assets/logo.png';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  
  const [startDate, setStartDate] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  
  const { latestData, historicalData, isLoading, error, fetchHistory } = useTelemetryData();
  const [visibleSensors, setVisibleSensors] = useState<string[]>(presets.powertrain);

  useEffect(() => {
    fetchHistory(startDate, endDate);
  }, [fetchHistory]);

  const handleSensorToggle = (sensorId: string) => {
    setVisibleSensors(prev => 
      prev.includes(sensorId) ? prev.filter(id => id !== sensorId) : [...prev, sensorId]
    );
  };

  const handlePresetChange = (presetName: string) => {
    if (presets[presetName]) setVisibleSensors(presets[presetName]);
  };
  
  const handleFetchDataByDate = () => fetchHistory(startDate, endDate);
  const handlePitCall = async () => {
    try { const response = await sendPitCallCommand(); alert(response.message); }
    catch (err) { alert('Erro ao enviar comando para o box.'); console.error(err); }
  };

  const widgetsToShow = sensorConfig.filter(s => visibleSensors.includes(s.id));

  const renderContent = () => {
    if (isLoading) return <Typography>Carregando dados...</Typography>;
    if (error) return <Typography color="error">ERRO: {error}</Typography>;

    return (
      <>
        <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#FFF' }}>Mostradores</Typography>
        <Box sx={styles.widgetsContainer}>
          {widgetsToShow.map(widget => (
            <GaugeComponent
              key={widget.id + '-gauge'}
              label={widget.label}
              value={latestData?.[widget.id] as number ?? 0}
              unit={widget.unit}
              maxValue={widget.maxValue || 100}
            />
          ))}
        </Box>

        <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#FFF' }}>Gráficos Históricos</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {widgetsToShow.map((chart, index) => {
            const isLastChart = index === widgetsToShow.length - 1;
            return (
              <Box key={chart.id + '-graph'} sx={{ width: '100%', height: isLastChart ? 220 : 200 }}>
                <ResponsiveContainer>
                  <LineChart data={historicalData} syncId="telemetrySync" margin={{ top: 10, right: 30, left: 0, bottom: isLastChart ? 5 : 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    {isLastChart && <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} stroke="#DDD" />}
                    <YAxis stroke="#DDD" domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#111' }} />
                    <Legend />
                    <Line type="monotone" dataKey={chart.id} name={chart.label} stroke={chart.color} dot={false} isAnimationActive={false} />
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
    <div
      style={{
        ...styles.pageContainer,
        backgroundColor: '#131E33',
        backgroundImage: `url(${logo})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1, display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{ ...styles.sidebar, backgroundColor: 'rgba(0,20,47,0.85)' }}>
          <Typography variant="h6" sx={{ color: '#FFF' }}>Controles</Typography>
          <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#FFF' }}>Comandos</Typography>
          <Button fullWidth variant="outlined" onClick={handlePitCall} sx={{ mb: 1, borderColor: '#FFF', color: '#FFF' }}>Chamar para o Box</Button>

          <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#FFF' }}>Período dos Gráficos</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <div>
              <label style={{ color: '#FFF' }}>Início:</label>
              <DatePicker selected={startDate} onChange={(date) => date && setStartDate(date)} showTimeSelect dateFormat="dd/MM/yyyy HH:mm" customInput={<input style={styles.datePickerInput} />} />
            </div>
            <div>
              <label style={{ color: '#FFF' }}>Fim:</label>
              <DatePicker selected={endDate} onChange={(date) => date && setEndDate(date)} showTimeSelect dateFormat="dd/MM/yyyy HH:mm" customInput={<input style={styles.datePickerInput} />} />
            </div>
            <Button fullWidth variant="outlined" onClick={handleFetchDataByDate} sx={{ borderColor: '#FFF', color: '#FFF' }}>Buscar Período</Button>
          </Box>

          <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#FFF' }}>Presets</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => handlePresetChange('powertrain')} sx={{ borderColor: '#FFF', color: '#FFF' }}>Powertrain</Button>
            <Button fullWidth variant="outlined" onClick={() => handlePresetChange('freios')} sx={{ borderColor: '#FFF', color: '#FFF' }}>Freios</Button>
            <Button fullWidth variant="outlined" onClick={() => handlePresetChange('suspensao')} sx={{ borderColor: '#FFF', color: '#FFF' }}>Suspensão</Button>
          </Box>

          <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#FFF' }}>Sensores Visíveis</Typography>
          {sensorConfig.map(sensor => (
            <Box key={sensor.id} sx={{ display: 'flex', alignItems: 'center', color: '#FFF', mb: 0.5 }}>
              <input type="checkbox" id={sensor.id} checked={visibleSensors.includes(sensor.id)} onChange={() => handleSensorToggle(sensor.id)} style={{ marginRight: '10px' }} />
              <label htmlFor={sensor.id}>{sensor.label}</label>
            </Box>
          ))}
        </aside>

        {/* Main content */}
        <div style={styles.mainContent}>
          <header style={styles.header}>
            <Typography variant="h4" sx={{ color: '#FFF' }}>Dashboard Imperador</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Link to="/export"><Button variant="outlined" sx={{ color: '#FFF', borderColor: '#FFF' }}>Exportar Dados</Button></Link>
              <Typography sx={{ color: '#FFF' }}>{user?.email}</Typography>
              <Button variant="outlined" color="error" onClick={logout}>Sair</Button>
            </Box>
          </header>

          <main>
            <Box sx={styles.liveDataContainer}>
              <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#FFF' }}>Alertas</Typography>
              <AlertsPanel data={latestData} />
            </Box>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
