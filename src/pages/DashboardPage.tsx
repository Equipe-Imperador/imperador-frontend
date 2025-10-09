// DASHBOARD PAGE
import { useState, useEffect } from 'react';
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
  const { user, role, logout } = useAuth(); // adicionado role

  const [startDate, setStartDate] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());

  const { latestData, historicalData, fetchHistory } = useTelemetryData();

  const [visibleSensors, setVisibleSensors] = useState<string[]>(presets.powertrain);

  useEffect(() => {
    // Limitar histórico para juízes: 7 dias
    if (role === 'juiz') {
      const now = new Date();
      setStartDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)); // 7 dias atrás
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
    if (presets[presetName]) {
      setVisibleSensors(presets[presetName]);
    }
  };

  const handleFetchDataByDate = () => {
    // juízes não podem alterar período, ignora
    if (role === 'juiz') return;
    fetchHistory(startDate, endDate);
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

        <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Gráficos Históricos</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {widgetsToShow.map((chart, index) => {
            const isLastChart = index === widgetsToShow.length - 1;
            return (
              <Box key={chart.id + '-graph'} sx={{ width: '100%', height: isLastChart ? 220 : 200 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={historicalData}
                    syncId="telemetrySync"
                    margin={{ top: 10, right: 30, left: 0, bottom: isLastChart ? 5 : 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    {isLastChart && (
                      <XAxis
                        dataKey="time"
                        tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                        stroke="#ccc"
                      />
                    )}
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
    <div style={{ position: 'relative', minHeight: '100vh', color: '#ccc' }}>
      {/* Fundo com logo */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${logo})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#131E33',
          filter: 'blur(3px)',
          opacity: 1,
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh', color: '#ccc' }}>
        {/* Sidebar */}
        <aside style={{ ...styles.sidebar, color: '#ccc' }}>
          <Typography variant="h6" sx={{ color: '#ccc' }}>Controles</Typography>

          {/* Comandos e presets visíveis apenas para integrantes */}
          {role === 'integrante' && (
            <>
              <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Comandos</Typography>
              <Button fullWidth variant="outlined" onClick={handlePitCall} sx={{ mb: 1, color: '#ccc', borderColor: '#ccc' }}>
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

                {/* Botão Últimos 10 minutos */}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    const now = new Date();
                    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
                    setStartDate(tenMinutesAgo);
                    setEndDate(now);
                    fetchHistory(tenMinutesAgo, now);
                  }}
                  sx={{ color: '#ccc', borderColor: '#ccc' }}
                >
                  Últimos 10 minutos
                </Button>
              </Box>

              <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Presets</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button fullWidth variant="outlined" onClick={() => handlePresetChange('powertrain')} sx={{ color: '#ccc', borderColor: '#ccc' }}>Powertrain</Button>
                <Button fullWidth variant="outlined" onClick={() => handlePresetChange('freios')} sx={{ color: '#ccc', borderColor: '#ccc' }}>Freios</Button>
                <Button fullWidth variant="outlined" onClick={() => handlePresetChange('suspensao')} sx={{ color: '#ccc', borderColor: '#ccc' }}>Suspensão</Button>
                <Button fullWidth variant="outlined" onClick={() => handlePresetChange('todos')} sx={{ color: '#ccc', borderColor: '#ccc' }}>Todos</Button>
              </Box>
            </>
          )}

          <Typography variant="subtitle1" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Sensores Visíveis</Typography>
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
        </aside>

        {/* Main content */}
        <div style={{ ...styles.mainContent, color: '#ccc' }}>
          <header style={styles.header}>
            <Typography variant="h4" sx={{ color: '#ccc' }}>Dashboard Imperador</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Export visível apenas para integrantes */}
              {role === 'integrante' && (
                <Link to="/export">
                  <Button variant="outlined" sx={{ color: '#ccc', borderColor: '#ccc' }}>Exportar Dados</Button>
                </Link>
              )}
              <Typography sx={{ color: '#ccc' }}>{user?.email}</Typography>
              <Button variant="outlined" color="error" onClick={logout} sx={{ color: 'error', borderColor: 'error' }}>Sair</Button>
            </Box>
          </header>

          <main>
            <Box sx={styles.liveDataContainer}>
              <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#ccc' }}>Alertas</Typography>
              <AlertsPanel data={latestData} />
            </Box>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
