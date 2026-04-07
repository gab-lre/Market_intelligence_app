'use client';

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ScoreEvolutionChartProps {
  data: Array<{
    date: string;
    score: number;
  }>;
}

export function ScoreEvolutionChart({ data }: ScoreEvolutionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
        Données insuffisantes pour l'évolution
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} 
          dy={10} 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#ffffff', 
            border: '1px solid #e2e8f0',
            borderRadius: '0px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#2b3652',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ color: '#00b4d8' }}
        />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#00b4d8" 
          strokeWidth={3} 
          dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }} 
          activeDot={{ r: 6, fill: '#00b4d8', stroke: '#ffffff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
