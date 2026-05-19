import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import PitCallButton from '../components/PitCallButton';
import { useAuth } from '../context/AuthContext';
import { useTelemetryData } from '../hooks/useTelemetryData';
import GaugeComponent from '../components/GaugeComponent';
import AlertsPanel from '../components/AlertsPanel';
import { 
  ResponsiveContainer, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Line, 
  ScatterChart, 
  Scatter
} from 'recharts';
import DatePicker from 'react-datepicker';
import { styles, sensorConfig, presets } from '../config/dashboardConfig';
import { 
  Box, 
  Button, 
  Typography, 
  ButtonGroup, 
  CircularProgress, 
  Divider, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import logo from '../assets/logo.png';
import "react-datepicker/dist/react-datepicker.css";

export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  const { latestData, historicalData, fetchHistory, isLoading } = useTelemetryData();
  
  // Datas para Timeline
  const [timelineStart, setTimelineStart] = useState<Date>(new Date(Date.now() - 60 * 60 * 1000));
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());

  // Configurações da Aba de Análise
  const [analysisStart, setAnalysisStart] = useState<Date>(new Date(Date.now() - 60 * 60 * 1000));
  const [analysisEnd, setAnalysisEnd] = useState<Date>(new Date());
  const [xAxisSensor, setXAxisSensor] = useState<string>('rpm');
  const [yAxisSensor, setYAxisSensor] = useState<string>('vel');

  const [visibleSensors, setVisibleSensors] = useState<string[]>(presets.powertrain);
  const [isRealtime, setIsRealtime] = useState<boolean>(true);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'analysis'>('timeline');

  useEffect(() => {
    if (role === "juiz") setIsRealtime(false);
  }, [role]);

  useEffect(() => {
    if (isRealtime) {
      const id = window.setInterval(() => {
        const ago = new Date(Date.now() - 10 * 60 * 1000);
        fetchHistory(ago, new Date());
      }, 5000);
      return () => window.clearInterval(id);
    }
  }, [isRealtime, fetchHistory]);

  useEffect(() => {
    if (!latestData || !latestData.time || latestData.isOld) return;
    // Tipagem explícita adicionada para corrigir erro Strict
    setRealtimeData((prev: any[]) => [...prev.slice(-300), latestData]);
  }, [latestData]);

  const applyCVTPreset = () => {
    setXAxisSensor('rpm');
    setYAxisSensor('vel');
  };

  const handleFetchTimeline = () => {
    setIsRealtime(false);
    fetchHistory(timelineStart, timelineEnd);
  };

  const handleFetchAnalysis = () => {
    setIsRealtime(false);
    fetchHistory(analysisStart, analysisEnd);
  };

  const chartData = isRealtime ? realtimeData : historicalData;
  const widgetsToShow = sensorConfig.filter(s => visibleSensors.includes(s.id));
  const getSensorLabel = (id: string) => sensorConfig.find(s => s.id === id)?.label || id;

  return (
    <div style={{ ...styles.pageContainer, position: 'relative' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundImage: `url(${logo})`, backgroundSize: '40%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'blur(3px)', opacity: 0.05, zIndex: 0 }} />
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%' }}>
        
        {/* SIDEBAR */}
        <aside style={{ ...styles.sidebar, backgroundColor: 'rgba(19, 30, 51, 0.9)', borderRight: '1px solid #333' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Controles</Typography>
          {role === 'integrante' && (
            <>
              <PitCallButton />
              <Divider sx={{ my: 3, borderColor: '#333' }} />
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Histórico Timeline</Typography>
              {/* Tipagem explícita adicionada no onChange */}
              <DatePicker selected={timelineStart} onChange={(d: Date | null) => d && setTimelineStart(d)} showTimeSelect dateFormat="dd/MM HH:mm" customInput={<input style={styles.datePickerInput} />} />
              <DatePicker selected={timelineEnd} onChange={(d: Date | null) => d && setTimelineEnd(d)} showTimeSelect dateFormat="dd/MM HH:mm" customInput={<input style={{ ...styles.datePickerInput, marginTop: '8px' }} />} />
              
              <Button fullWidth variant="contained" onClick={handleFetchTimeline} sx={{ mt: 1, bgcolor: '#222' }}>Buscar</Button>
              <Button fullWidth variant="outlined" onClick={() => setIsRealtime(true)} sx={{ mt: 1, color: isRealtime ? '#FFD700' : '#888', borderColor: isRealtime ? '#FFD700' : '#555' }}>Tempo Real</Button>
              
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Presets de Exibição</Typography>
              {Object.keys(presets).map(p => (
                <Button key={p} fullWidth variant="outlined" onClick={() => { setVisibleSensors(presets[p]); setViewMode('timeline'); }} sx={{ mt: 0.5, color: '#ccc', borderColor: '#444', fontSize: '0.7rem' }}>
                  {p.toUpperCase()}
                </Button>
              ))}
            </>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <div style={styles.mainContent}>
          <header style={{ ...styles.header, borderBottom: '1px solid #333', paddingBottom: '16px' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Imperador Telemetria</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              
              <ButtonGroup variant="outlined">
                <Button onClick={() => setViewMode('timeline')} sx={{ bgcolor: viewMode === 'timeline' ? '#222' : 'transparent', color: '#ccc' }}>Timeline</Button>
                <Button onClick={() => setViewMode('analysis')} sx={{ bgcolor: viewMode === 'analysis' ? '#222' : 'transparent', color: '#ccc' }}>Análise</Button>
              </ButtonGroup>

              {role === 'integrante' && (
                <Button component={RouterLink} to="/export" variant="outlined" color="info" size="small" startIcon={<DownloadIcon />}>Exportar</Button>
              )}

              <Typography variant="body2">{user?.email}</Typography>
              <Button variant="outlined" color="error" size="small" onClick={logout}>Sair</Button>
            </Box>
          </header>

          <AlertsPanel data={latestData} />

          <Typography variant="h6" style={styles.sectionTitle}>Mostradores</Typography>
          <Box style={styles.widgetsContainer}>
            {widgetsToShow.map(w => (
              <GaugeComponent key={w.id} label={w.label} value={latestData?.[w.id]} unit={w.unit} isOld={latestData?.isOld} />
            ))}
          </Box>

          {/* ABA 1: TIMELINE */}
          {viewMode === 'timeline' && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" style={styles.sectionTitle}>Visualização Temporal</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, bgcolor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: 2 }}>
                {widgetsToShow.map((sensor, index) => {
                  const isLast = index === widgetsToShow.length - 1;
                  return (
                    <Box key={sensor.id} sx={{ width: '100%', height: isLast ? 180 : 130, pt: 1 }}>
                      <Typography sx={{ color: sensor.color, fontSize: '0.8rem', fontWeight: 'bold', mb: 0.5, ml: 6 }}>{sensor.label}</Typography>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} syncId="motecSync" margin={{ top: 5, right: 30, left: 0, bottom: isLast ? 20 : 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          {/* Tipagem explícita adicionada no tickFormatter */}
                          <XAxis dataKey="time" hide={!isLast} tickFormatter={(t: string | number) => new Date(t).toLocaleTimeString()} stroke="#888" />
                          <YAxis stroke="#888" fontSize={10} width={50} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#444', color: '#fff' }} isAnimationActive={false} />
                          <Line type="monotone" dataKey={sensor.id} stroke={sensor.color} dot={false} strokeWidth={2} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* ABA 2: ANÁLISE CUSTOMIZADA */}
          {viewMode === 'analysis' && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" style={styles.sectionTitle}>Análise de Correlação (Gráfico XY)</Typography>
              
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: 2, border: '1px solid #333' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', mb: 4 }}>
                  
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ color: '#aaa' }}>Eixo X</InputLabel>
                    <Select value={xAxisSensor} label="Eixo X" onChange={(e) => setXAxisSensor(e.target.value)} sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#555' } }}>
                      {sensorConfig.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ color: '#aaa' }}>Eixo Y</InputLabel>
                    <Select value={yAxisSensor} label="Eixo Y" onChange={(e) => setYAxisSensor(e.target.value)} sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#555' } }}>
                      {sensorConfig.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <Button variant="outlined" onClick={applyCVTPreset} sx={{ color: '#04f591', borderColor: '#04f591' }}>Preset CVT</Button>

                  <Divider orientation="vertical" flexItem sx={{ borderColor: '#444' }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DatePicker selected={analysisStart} onChange={(d: Date | null) => d && setAnalysisStart(d)} showTimeSelect dateFormat="dd/MM HH:mm" customInput={<input style={{ ...styles.datePickerInput, width: '130px' }} />} />
                    <Typography>até</Typography>
                    <DatePicker selected={analysisEnd} onChange={(d: Date | null) => d && setAnalysisEnd(d)} showTimeSelect dateFormat="dd/MM HH:mm" customInput={<input style={{ ...styles.datePickerInput, width: '130px' }} />} />
                  </Box>

                  <Button variant="contained" onClick={handleFetchAnalysis} disabled={isLoading} sx={{ bgcolor: '#004aad' }}>
                     {isLoading ? <CircularProgress size={20} color="inherit" /> : "Gerar Gráfico"}
                  </Button>
                </Box>

                <Box sx={{ height: 500, bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 1 }}>
                  <Typography sx={{ color: '#ccc', mb: 2, textAlign: 'center', fontSize: '0.9rem' }}>
                    {getSensorLabel(xAxisSensor)} (X) vs {getSensorLabel(yAxisSensor)} (Y)
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                      <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                      <XAxis type="number" dataKey={xAxisSensor} name={getSensorLabel(xAxisSensor)} stroke="#ccc" unit="" domain={['auto', 'auto']} />
                      <YAxis type="number" dataKey={yAxisSensor} name={getSensorLabel(yAxisSensor)} stroke="#ccc" unit="" domain={['auto', 'auto']} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#222', border: 'none' }} />
                      <Scatter data={historicalData} fill="#04f591" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}