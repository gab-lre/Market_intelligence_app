'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DepartmentDistributionChartProps {
  data: Array<{
    department: string;
    count: number;
    color: string;
  }>;
}

export function DepartmentDistributionChart({ data }: DepartmentDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
        Données insuffisantes
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <XAxis 
          dataKey="department" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} 
          tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
          dy={10}
        />
        <Tooltip 
          cursor={{ fill: 'transparent' }}
          contentStyle={{ 
            backgroundColor: '#ffffff', 
            border: '1px solid #e2e8f0',
            borderRadius: '0px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#2b3652',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ color: '#2b3652' }}
        />
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
