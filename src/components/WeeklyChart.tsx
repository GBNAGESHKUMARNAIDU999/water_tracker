import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WeeklyChartProps {
  history: Record<string, number>;
  goal: number;
  theme: {
    hex: string;
    text: string;
  };
}

export default function WeeklyChart({ history, goal, theme }: WeeklyChartProps) {
  // Generate last 7 days data
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    data.push({
      name: dayName,
      intake: history[dateKey] || 0,
      isToday: i === 0,
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 p-3 rounded-xl shadow-2xl border border-slate-800">
          <p className="text-sm font-semibold text-white">{data.fullDate}</p>
          <p className={`text-sm ${theme.text} font-medium mt-1`}>
            {payload[0].value} ml
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-56 mt-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Last 7 Days
        </h3>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'L' : value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Bar dataKey="intake" radius={[6, 6, 6, 6]} maxBarSize={32}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.intake >= goal ? '#10b981' : entry.isToday ? theme.hex : '#334155'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
