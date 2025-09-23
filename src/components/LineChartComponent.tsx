
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';

interface LineChartProps {
  data: any[]; // Os dados para o gráfico
  dataKey: string; // O sensor que vamos plotar (ex: "rpm_motor")
  label: string;
  color: string;
}

const LineChartComponent = ({ data, dataKey, label, color }: LineChartProps) => {
  if (!data || data.length === 0) {
    return <Typography sx={{color: 'white'}}>Carregando dados do gráfico...</Typography>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
       <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>{label}</Typography>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis 
            dataKey="time" 
            stroke="#ccc"
            // Formata o timestamp para mostrar apenas HH:mm:ss
            tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()}
          />
          <YAxis stroke="#ccc" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line type="monotone" dataKey={dataKey} name={label} stroke={color} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;