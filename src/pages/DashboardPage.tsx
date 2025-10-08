// DASHBOARD PAGE - RESPONSIVE FIXED
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
import { Box, Button, Typography, IconButton, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/logo.png';

export default function DashboardPage() {
  const { user, role, logout } = useAuth();

  const [startDate, setStartDate] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { latestData, historicalData, isLoading, error, fetchHistory } = useTelemetryData();
  const [visibleSensors, setVisibleSensors] = useState<string[]>(presets.powertrain);

  useEffect(() => {
    const now = new Date();
    if (role === 'juiz') {
      setStartDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      setEndDate(now);
      fetchHistory(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
    } else {
      fetchHistory(startDate, endDate);
    }
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

  const renderContent = () => {
    if (isLoading) return <Typography sx={{ color: '#ccc' }}>Carregando dados...</Typography>;
    if (error) return <Typography sx={{ color: '#ccc' }}>ERRO: {error}</Typography>;

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
            />
          ))}
        </Box>

        <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#ccc', mt: 3 }}>Gráficos Históricos</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {widgetsToShow.map((chart, index) => (
            <Box key={chart.id + '-graph'} sx={{ width: '100%', height: index === widgetsToShow.length - 1 ? 220 : 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} syncId="telemetrySync">
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    stroke="#ccc"
                  />
                  <YAxis stroke="#ccc" domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#222', color: '#ccc' }} />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
                  <Line type="monotone" dataKey={chart.id} name={chart.label} stroke={chart.color} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ))}
        </Box>
      </>
    );
  };

  const sidebarContent = (
    <Box sx={{ width: 250, p: 2, bgcolor: '#131E33', height: '100%', color: '#ccc' }}>
      <Typography variant="h6" sx={{ color: '#ccc', mb: 2 }}>Controles</Typography>

      {role === 'integrante' && (
        <>
          <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Comandos</Typography>
          <Button fullWidth variant="outlined" onClick={handlePitCall} sx={{ mb: 2, color: '#ccc', borderColor: '#ccc' }}>
            Chamar para o Box
          </Button>

          <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Período dos Gráficos</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <div>
              <label style={{ color: '#ccc' }}>Início:</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => date && setStartDate(date)}
                showTimeSelect
                dateFormat="dd/MM/yyyy HH:mm"
                customInput={<input style={styles.datePickerInput} />}
              />
            </div>
            <div>
              <label style={{ color: '#ccc' }}>Fim:</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => date && setEndDate(date)}
                showTimeSelect
                dateFormat="dd/MM/yyyy HH:mm"
                customInput={<input style={styles.datePickerInput} />}
              />
            </div>
            <Button fullWidth variant="outlined" onClick={handleFetchDataByDate} sx={{ color: '#ccc', borderColor: '#ccc' }}>
              Buscar Período
            </Button>
            <Button fullWidth variant="outlined" onClick={handleLast10Minutes} sx={{ color: '#ccc', borderColor: '#ccc', mt: 1 }}>
              Últimos 10 Minutos
            </Button>
          </Box>

          <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Presets</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => handlePresetChange('powertrain')} sx={{ color: '#ccc', borderColor: '#ccc' }}>Powertrain</Button>
            <Button fullWidth variant="outlined" onClick={() => handlePresetChange('freios')} sx={{ color: '#ccc', borderColor: '#ccc' }}>Freios</Button>
            <Button fullWidth variant="outlined" onClick={() => handlePresetChange('suspensao')} sx={{ color: '#ccc', borderColor: '#ccc' }}>Suspensão</Button>
          </Box>
        </>
      )}

      <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#ccc', mt: 2 }}>Sensores Visíveis</Typography>
      {sensorConfig.map(sensor => (
        <Box key={sensor.id} sx={{ ...styles.checkboxLabel, color: '#ccc' }}>
          <input
            type="checkbox"
            id={sensor.id}
            checked={visibleSensors.includes(sensor.id)}
            onChange={() => handleSensorToggle(sensor.id)}
            style={{ marginRight: '10px' }}
          />
          <label htmlFor={sensor.id} style={{ color: '#ccc' }}>{sensor.label}</label>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#131E33', color: '#ccc', overflowX: 'hidden' }}>
      {/* Fundo com logo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${logo})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)',
          opacity: 1,
          zIndex: 0
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Sidebar desktop */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          {sidebarContent}
        </Box>

        {/* Sidebar mobile */}
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{ sx: { bgcolor: '#131E33', color: '#ccc', border: 'none', width: 250 } }}
        >
          {sidebarContent}
        </Drawer>

        {/* Main content */}
        <Box sx={{ flex: 1, p: { xs: 1, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" sx={{ color: '#ccc', fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Dashboard Imperador
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton sx={{ display: { xs: 'block', md: 'none' }, color: '#ccc' }} onClick={() => setSidebarOpen(true)}>
                <MenuIcon />
              </IconButton>

              {role === 'integrante' && (
                <Link to="/export">
                  <Button variant="outlined" sx={{ color: '#ccc', borderColor: '#ccc' }}>Exportar Dados</Button>
                </Link>
              )}
              <Typography sx={{ color: '#ccc' }}>{user?.email}</Typography>
              <Button variant="outlined" color="error" onClick={logout} sx={{ color: 'error', borderColor: 'error' }}>Sair</Button>
            </Box>
          </Box>

          <Box sx={styles.liveDataContainer}>
            <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Alertas</Typography>
            <AlertsPanel data={latestData} />
          </Box>

          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}
