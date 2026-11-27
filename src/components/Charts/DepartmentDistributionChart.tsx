'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronRight } from 'lucide-react';

interface DepartmentDistributionChartProps {
  data: Array<{
    department: string;
    count: number;
  }>;
}

export function DepartmentDistributionChart({ data }: DepartmentDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#707478] text-sm font-medium">
        Données insuffisantes
      </div>
    );
  }

  // Calculate percentages for the right hand side list
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex w-full h-full">
      {/* Radar Chart (Left side) */}
      <div className="flex-[2] h-full relative -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
            <PolarGrid stroke="#E0E0E0" />
            <PolarAngleAxis 
              dataKey="department" 
              tick={{ fill: '#707478', fontSize: 10, fontWeight: 500 }}
              tickFormatter={(val) => {
                const item = data.find(d => d.department === val);
                if (item && total > 0) {
                  return `${Math.round((item.count / total) * 100)}%`;
                }
                return '0%';
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #E0E0E0',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1A1C1E',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#1E8449' }}
            />
            <Radar 
              name="Opportunités" 
              dataKey="count" 
              stroke="#1E8449" 
              strokeWidth={1.5}
              fill="#d2eddf" 
              fillOpacity={0.6}
              dot={{ r: 2.5, fill: '#1E8449', strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#1E8449', stroke: '#ffffff', strokeWidth: 1 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* List (Right side) */}
      <div className="flex-[1.2] flex flex-col justify-center space-y-3 pl-2 overflow-y-auto plugin-noscrollbar">
        {data.map((item, i) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.department} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                 <span className="text-[10px] sm:text-[12px] font-semibold text-[#1A1C1E] truncate max-w-[80px]" title={item.department}>
                   {item.department.charAt(0).toUpperCase() + item.department.slice(1)}
                 </span>
                 <ChevronRight className="w-3 h-3 text-[#A0A4A8]" strokeWidth={2} />
              </div>
              <span className="text-[10px] sm:text-[12px] font-medium text-[#707478]">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
