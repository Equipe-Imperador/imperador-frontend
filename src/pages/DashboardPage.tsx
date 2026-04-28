import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import PitCallButton from '../components/PitCallButton';
import { useAuth } from '../context/AuthContext';
import { useTelemetryData } from '../hooks/useTelemetryData';
import GaugeComponent from '../components/GaugeComponent';
import AlertsPanel from '../components/AlertsPanel';
import UltraLineChart from '../components/UltraLineChart'; // Gráfico MoTeC
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts'; // Para Análise
import DatePicker from 'react-datepicker';
import { styles, sensorConfig, presets } from '../config/dashboardConfig';
import { Box, Button, Typography, ButtonGroup, CircularProgress } from '@mui/material';
import logo from '../assets/logo.png';
import "react-datepicker/dist/react-datepicker.css";

export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  
  // FIX DO DATEPICKER: Estados separados do tempo real
  const [pickerStart, setPickerStart] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [pickerEnd, setPickerEnd] = useState(new Date());

  // Estados de data EXCLUSIVOS para Análise CVT
  const [analysisStart, setAnalysisStart] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [analysisEnd, setAnalysisEnd] = useState(new Date());

  const { latestData, historicalData, fetchHistory, isLoading } = useTelemetryData();
  const [visibleSensors, setVisibleSensors] = useState<string[]>(presets.powertrain);
  const [isRealtime, setIsRealtime] = useState(true);
  const realtimeIntervalRef = useRef<number | null>(null);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  // Controle de abas
  const [viewMode, setViewMode] = useState<'timeline' | 'analysis'>('timeline');

  useEffect(() => {
    if (role === "juiz") setIsRealtime(false);
  }, [role]);

  useEffect(() => {
    if (isRealtime) {
      const id = window.setInterval(() => {
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        // O segredo do DatePicker: não alteramos o pickerStart/End aqui, só buscamos os dados
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
      const MAX = 600; // Dobramos para uma linha do tempo melhor
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
    fetchHistory(pickerStart, pickerEnd);
  };

  const handleFetchAnalysis = () => {
    setIsRealtime(false);
    fetchHistory(analysisStart, analysisEnd);
  };

  const widgetsToShow = sensorConfig.filter((s: any) => visibleSensors.includes(s.id));

  const renderContent = () => {
    if (!widgetsToShow || widgetsToShow.length === 0) {
      return <Typography sx={{ color: "#ccc", textAlign: "center", mt: 4 }}>Nenhum sensor selecionado.</Typography>;
    }

    const chartData = isRealtime ? realtimeData : historicalData;

    return (
      <>
        {/* MOSTRADORES ORIGINAIS */}
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

        {/* CONTROLE DE ABAS (TIMELINE VS ANÁLISE) */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 4, mb: 2 }}>
          <Typography variant="h6" sx={{ ...styles.sectionTitle, color: '#ccc', m: 0 }}>
            {isRealtime ? "Dados em Tempo Real" : "Dados Históricos"}
          </Typography>
          
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => setViewMode('timeline')} 
              sx={{ bgcolor: viewMode === 'timeline' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#ccc', borderColor: '#444' }}
            >
              Timeline (MoTeC)
            </Button>
            <Button 
              onClick={() => setViewMode('analysis')} 
              sx={{ bgcolor: viewMode === 'analysis' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#ccc', borderColor: '#444' }}
            >
              Análise CVT
            </Button>
          </ButtonGroup>
        </Box>
        
        {/* ABA: TIMELINE ESTILO MOTEC */}
        {viewMode === 'timeline' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.4)', p: 1, borderRadius: 2, border: '1px solid #333' }}>
            {widgetsToShow.map((chart: any, index: number) => {
              const isLastChart = index === widgetsToShow.length - 1;
              return (
                <Box key={chart.id + '-graph'} sx={{ width: '100%', borderBottom: isLastChart ? 'none' : '1px solid #333', pb: isLastChart ? 0 : 1, pt: index === 0 ? 0 : 1 }}>
                  <Typography sx={{ color: chart.color, fontSize: '0.8rem', fontWeight: 'bold', ml: 1 }}>{chart.label}</Typography>
                  <UltraLineChart 
                    data={chartData} 
                    dataKey={chart.id} 
                    label={chart.label} 
                    color={chart.color} 
                    isLast={isLastChart} 
                  />
                </Box>
              );
            })}
          </Box>
        )}

        {/* ABA: ANÁLISE SCATTER PLOT */}
        {viewMode === 'analysis' && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, bgcolor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2, alignItems: 'center', mb: 3 }}>
              <Typography variant="body2">Filtrar Curva:</Typography>
              <DatePicker selected={analysisStart} onChange={(d) => d && setAnalysisStart(d)} showTimeSelect dateFormat="dd/MM HH:mm" customInput={<input style={styles.datePickerInput} />} />
              <Typography>até</Typography>
              <DatePicker selected={analysisEnd} onChange={(d) => d && setAnalysisEnd(d)} showTimeSelect dateFormat="dd/MM HH:mm" customInput={<input style={styles.datePickerInput} />} />
              <Button variant="contained" onClick={handleFetchAnalysis} disabled={isLoading} sx={{ bgcolor: '#222' }}>
                {isLoading ? <CircularProgress size={20} color="inherit" /> : "Processar Curva"}
              </Button>
            </Box>

            <Box sx={{ width: '100%', height: 500, backgroundColor: 'rgba(0,0,0,0.4)', p: 3, borderRadius: 2, border: '1px solid #333' }}>
              <Typography sx={{ color: '#04f591', fontSize: '1rem', mb: 2, textAlign: 'center' }}>Curva de CVT: RPM vs Velocidade</Typography>
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis type="number" dataKey="rpm" name="RPM" stroke="#ccc" domain={['auto', 'auto']} unit=" rpm" />
                  <YAxis type="number" dataKey="vel" name="Velocidade" stroke="#ccc" domain={['auto', 'auto']} unit=" km/h" />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#222', borderColor: '#444' }} />
                  <Scatter name="Dados CVT" data={historicalData} fill="#04f591" />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}
      </>
    );
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: '#ccc', backgroundColor: '#131E33' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundImage: `url(${logo})`, backgroundSize: '40%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'blur(3px)', opacity: 0.05, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' }}>
        
        {/* SIDEBAR ORIGINAL PROTEGIDA */}
        <aside style={{ ...styles.sidebar, width: '260px', borderRight: '1px solid #333', padding: '20px' }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Controles</Typography>
          {role === 'integrante' && (
            <>
              <PitCallButton />
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Período Histórico</Typography>
              <DatePicker 
                selected={pickerStart} 
                onChange={(d) => d && setPickerStart(d)} 
                showTimeSelect 
                dateFormat="dd/MM/yyyy HH:mm" 
                popperPlacement="bottom-start"
                customInput={<input style={{ ...styles.datePickerInput, width: '100%', marginBottom: '10px' }} />} 
              />
              <DatePicker 
                selected={pickerEnd} 
                onChange={(d) => d && setPickerEnd(d)} 
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
          
          {/* HEADER ORIGINAL PROTEGIDO */}
          <header style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <Typography variant="h4">Dashboard Imperador</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              
              {role === 'integrante' && (
                <Button 
                  component={RouterLink} 
                  to="/export" 
                  variant="outlined" 
                  color="info" 
                  size="small"
                  startIcon={<DownloadIcon />}
                >
                  Exportar Dados
                </Button>
              )}

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