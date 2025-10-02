import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: any[];
  dataKey: string;
  label: string;
  color: string;
  isLast: boolean; // Propriedade adicionada
}

const LineChartComponent = ({ data, dataKey, label }: ChartProps) => {
  return (
    <div style={{ width: '100%', height: 300, backgroundColor: '#1E1E1E', padding: '20px', borderRadius: '8px', border: '1px solid #444' }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            dataKey="time"
            stroke="#AAA"
            tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()} 
          />
          <YAxis stroke="#AAA" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', border: 'none' }} 
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line type="monotone" dataKey={dataKey} name={label} stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(LineChartComponent); // Envolvemos com React.memo para otimização