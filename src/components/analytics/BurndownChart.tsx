import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BurndownDataPoint } from '@/utils/analyticsTransformers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CustomChartTooltip } from './ChartTooltip';

export interface BurndownChartProps {
  data: BurndownDataPoint[];
}

export function BurndownChart({ data }: BurndownChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Sprint Burndown</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ideal vs actual remaining story points across the 14-day iteration
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0070c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0070c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.2 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.2 }}
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip valueFormatter={(val) => `${val} pts`} />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="idealRemaining"
                name="Ideal Guideline"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#idealGrad)"
              />
              <Area
                type="monotone"
                dataKey="actualRemaining"
                name="Actual Remaining Points"
                stroke="#0070c7"
                strokeWidth={2.5}
                fill="url(#actualGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
