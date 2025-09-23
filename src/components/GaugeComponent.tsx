
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

interface GaugeProps {
  value: number;
  label: string;
  maxValue: number;
  unit?: string;
}

const GaugeComponent = ({ value, label, maxValue, unit = '' }: GaugeProps) => {
  const data = [{ name: 'value', value }];

  return (
    <Box sx={{ width: 200, height: 200, position: 'relative', textAlign: 'center' }}>
      <ResponsiveContainer>
        <RadialBarChart
          innerRadius="80%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
          barSize={20}
          // A propriedade 'domain' foi REMOVIDA daqui
        >
          <PolarAngleAxis
            type="number"
            domain={[0, maxValue]} // O domain correto fica aqui, no eixo
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#333' }}
            dataKey="value"
            angleAxisId={0}
            fill="#8884d8"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-20px'
        }}
      >
        <Typography variant="h4" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
          {value.toFixed(0)}
        </Typography>
        <Typography variant="body1" component="div" sx={{ color: 'gray' }}>
          {label} {unit && `(${unit})`}
        </Typography>
      </Box>
    </Box>
  );
};

export default GaugeComponent;