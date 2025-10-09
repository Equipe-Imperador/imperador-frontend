
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
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

      {sensors.map((sensor, idx) => (
        <Box
          key={sensor.id}
          sx={{
            width: '100%',
            height: idx === sensors.length - 1 ? 220 : 180,
            mb: 2,
            bgcolor: 'rgba(0, 20, 47, 0.5)',
            borderRadius: 2,
            p: 1,
          }}
        >
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="time"
                tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                stroke="#ccc"
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#ccc" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#222', color: '#ccc' }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#ccc' }} />
              <Line
                type="monotone"
                dataKey={sensor.id}
                name={sensor.label}
                stroke={sensor.color || '#66b2ff'}
                dot={false}
                isAnimationActive={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ))}
    </Box>
  );
}
