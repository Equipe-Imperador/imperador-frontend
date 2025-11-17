
import UltraLineChart from "../components/UltraLineChart";
import { Box, Typography } from '@mui/material';

interface ChartsSectionProps {
  data: any[];
  sensors: { id: string; label: string; color?: string }[];
}

export default function ChartsSection({ data, sensors }: ChartsSectionProps) {
  if (!data || data.length === 0) {
    return (
      <Typography sx={{ textAlign: 'center', color: '#aaa', mt: 2 }}>
        Nenhum dado disponível para exibir gráficos.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography sx={{ mb: 1, fontSize: 16, textAlign: 'center' }}>Gráficos</Typography>

      { sensors.map((sensor) => (
  <Box
    key={sensor.id}
    sx={{
      width: '100%',
      height: 220,
      mb: 2,
      bgcolor: 'rgba(0, 20, 47, 0.5)',
      borderRadius: 2,
      p: 1,
    }}
  >
    <UltraLineChart
      data={data}
      dataKey={sensor.id}
      label={sensor.label}
      color={sensor.color || "#66b2ff"}
    />
  </Box>
)) }
      
    </Box>
  );
}
