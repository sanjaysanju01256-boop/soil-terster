
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoryEntry } from '../types';

interface HistoryChartProps {
  data: HistoryEntry[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
  const chartData = data.slice().reverse().map(entry => ({
    name: new Date(entry.timestamp).toLocaleDateString(),
    pH: entry.ph,
    Moisture: entry.moisture,
    Temperature: entry.temperature,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)', // bg-gray-800 with opacity
                border: '1px solid #4B5563', // border-gray-600
                borderRadius: '0.5rem', // rounded-lg
            }}
        />
        <Legend wrapperStyle={{fontSize: "14px"}}/>
        <Line type="monotone" dataKey="pH" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Moisture" stroke="#82ca9d" />
        <Line type="monotone" dataKey="Temperature" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoryChart;
