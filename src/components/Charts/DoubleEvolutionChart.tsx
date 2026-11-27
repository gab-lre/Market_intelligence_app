'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DoubleEvolutionChartProps {
  data: Array<{
    date: string;
    score: number;
    volume: number;
  }>;
}

export function DoubleEvolutionChart({ data }: DoubleEvolutionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#707478] text-sm font-medium">
        Données insuffisantes
      </div>
    );
  }

  // Compute perfect ticks for Volume (Left Axis) - 7 ticks, starts at 0
  const volMaxRaw = Math.max(...data.map((d) => d.volume));
  let volStep = Math.max(1, Math.ceil((volMaxRaw || 10) / 6));
  if (volStep > 2) volStep = Math.ceil(volStep / 2) * 2;
  const volTicks = Array.from({ length: 7 }, (_, i) => i * volStep);

  // Compute perfect ticks for Score (Right Axis) - 7 ticks
  let scoreMinRaw = Math.min(...data.map((d) => d.score));
  let scoreMaxRaw = Math.max(...data.map((d) => d.score));
  if (scoreMinRaw === scoreMaxRaw) { scoreMinRaw -= 10; scoreMaxRaw += 10; }
  let scoreStep = Math.ceil((scoreMaxRaw - scoreMinRaw) / 6);
  if (scoreStep > 5) scoreStep = Math.ceil(scoreStep / 5) * 5;
  else if (scoreStep > 2) scoreStep = 5;
  let scoreMin = Math.floor(scoreMinRaw / scoreStep) * scoreStep;
  while (scoreMin + scoreStep * 6 < scoreMaxRaw) {
    scoreStep += (scoreStep >= 5 ? 5 : 1);
    scoreMin = Math.floor(scoreMinRaw / scoreStep) * scoreStep;
  }
  const scoreTicks = Array.from({ length: 7 }, (_, i) => scoreMin + i * scoreStep);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#257b57" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A0A4A8" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#e2e8f0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#707478', fontWeight: 500 }} 
          dy={10} 
        />
        <YAxis 
          yAxisId="left"
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#707478', fontWeight: 500 }} 
          width={25}
          ticks={volTicks}
          domain={[volTicks[0], volTicks[6]]}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#707478', fontWeight: 500 }}
          width={25}
          ticks={scoreTicks}
          domain={[scoreTicks[0], scoreTicks[6]]}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#ffffff', 
            border: 'none',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#1A1C1E',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
          itemStyle={{ color: '#1A1C1E' }}
        />
        {/* We use type="monotone" for smooth curves. */}
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey="volume" 
          stroke="#A0A4A8" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorVolume)" 
          activeDot={{ r: 6, fill: '#A0A4A8', stroke: '#ffffff', strokeWidth: 2 }}
        />
        <Area 
          yAxisId="right"
          type="monotone" 
          dataKey="score" 
          stroke="#257b57" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorScore)" 
          activeDot={{ r: 6, fill: '#257b57', stroke: '#ffffff', strokeWidth: 2 }}
        />
        {/* Placed at the end so lines are drawn OVER the graphs */}
        <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="0" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
