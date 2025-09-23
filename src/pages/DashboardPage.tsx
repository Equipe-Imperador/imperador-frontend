import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import GaugeComponent from '../components/GaugeComponent';
import LineChartComponent from '../components/LineChartComponent';
import { getLatestTelemetry, getHistoricalTelemetry } from '../services/telemetryService';
import { Box, Typography, Button, CircularProgress } from '@mui/material';

// A interface completa que descreve um ponto de telemetria
interface TelemetryData {
  time: string;
  tensao_bateria: number;
  temperatura_bateria: number;
  rpm_motor: number;
  nivel_combustivel: number;
  velocidade_eixo_traseiro: number;
  pressao_freio_traseiro: number;
  pressao_freio_dianteiro: number;
  temp_cvt: number;
  // Adicione aqui todos os outros sensores que a API pode retornar
}

const DashboardPage = () => {
  const { user, logout } = useAuth();
  
  // Estados para os dados
  const [latestData, setLatestData] = useState<Partial<TelemetryData> | null>(null);
  const [historicalData, setHistoricalData] = useState<TelemetryData[]>([]);
  
  // Estados para controle de UI (Loading e Erro)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para o preset ativo
  const [preset, setPreset] = useState('powertrain');

  useEffect(() => {
    // Função unificada para buscar todos os dados necessários
    const fetchAllData = async () => {
      try {
        setError(null); // Limpa erros antigos a cada nova busca
        
        const [latest, history] = await Promise.all([
          getLatestTelemetry(),
          getHistoricalTelemetry(
            new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutos atrás
            new Date().toISOString()
          )
        ]);

        setLatestData(latest);
        setHistoricalData(history);
      } catch (err: any) {
        console.error("Falha ao buscar dados:", err);
        if (err.response?.status === 401) {
            setError("Sessão expirada. Por favor, faça o login novamente.");
            logout(); // Força o logout se o token for inválido
        } else {
            setError("Não foi possível carregar os dados. Verifique a conexão com o servidor e se há dados sendo enviados via MQTT.");
        }
      } finally {
        setIsLoading(false); // Marca o carregamento como concluído, mesmo se der erro
      }
    };

    fetchAllData(); // Busca os dados a primeira vez
    
    // Configura o intervalo para buscar apenas os dados em tempo real a cada segundo
    const intervalId = setInterval(async () => {
        try {
            const latest = await getLatestTelemetry();
            setLatestData(latest);
        } catch (err) {
            console.error("Falha ao buscar dados em tempo real:", err);
            setError("Conexão com a telemetria em tempo real perdida.");
        }
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado para evitar vazamento de memória
    return () => clearInterval(intervalId);
  }, []); // O array vazio garante que isso rode apenas uma vez ao carregar a página

  // Função auxiliar para renderizar o conteúdo principal do dashboard
  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography sx={{ color: 'white', ml: 2 }}>Carregando dados...</Typography>
        </Box>
      );
    }

    if (error) {
      return <Typography sx={{ color: 'red', mt: 4, textAlign: 'center' }}>{error}</Typography>;
    }

    if (preset === 'powertrain') {
      return (
        <>
          <Typography variant="h5" sx={{ color: 'white', mt: 2, mb: 2 }}>Preset: Powertrain</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <GaugeComponent value={latestData?.rpm_motor ?? 0} label="RPM" maxValue={9000} />
            <GaugeComponent value={latestData?.velocidade_eixo_traseiro ?? 0} label="Velocidade" unit="km/h" maxValue={120} />
            <GaugeComponent value={latestData?.temp_cvt ?? 0} label="Temp. CVT" unit="°C" maxValue={120} />
          </Box>
          <Box sx={{mt: 4}}>
             <LineChartComponent data={historicalData} dataKey="rpm_motor" label="RPM do Motor" color="#8884d8" />
          </Box>
        </>
      );
    }

    if (preset === 'freios') {
      return (
        <>
          <Typography variant="h5" sx={{ color: 'white', mt: 2, mb: 2 }}>Preset: Freios</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <GaugeComponent value={latestData?.pressao_freio_dianteiro ?? 0} label="Pressão Freio Diant." unit="bar" maxValue={50} />
            <GaugeComponent value={latestData?.pressao_freio_traseiro ?? 0} label="Pressão Freio Tras." unit="bar" maxValue={50} />
          </Box>
           <Box sx={{mt: 4}}>
             <LineChartComponent data={historicalData} dataKey="pressao_freio_dianteiro" label="Pressão Freio Dianteiro" color="#82ca9d" />
          </Box>
        </>
      );
    }

    return null; // Caso nenhum preset seja selecionado
  };

  return (
    <MainLayout onPresetChange={setPreset}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {user && <Typography sx={{ color: 'white' }}>Bem-vindo, {user.email}!</Typography>}
        <Button variant="contained" color="secondary" onClick={logout}>Sair</Button>
      </Box>
      <hr />
      
      {renderContent()}
    </MainLayout>
  );
};

export default DashboardPage;