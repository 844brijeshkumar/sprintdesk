import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AssigneeWorkloadItem } from '@/utils/analyticsTransformers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CustomChartTooltip } from './ChartTooltip';

export interface WorkloadBarChartProps {
  data: AssigneeWorkloadItem[];
}

export function WorkloadBarChart({ data }: WorkloadBarChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Team Workload & Capacity</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Story points completed vs in-flight by team engineer
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.2 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.2 }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomChartTooltip valueFormatter={(val) => `${val} pts`} />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar dataKey="completedPoints" name="Done Points" fill="#10b981" stackId="a" radius={[0, 0, 4, 4]} barSize={28} />
              <Bar dataKey="totalPoints" name="Remaining Points" fill="#3b82f6" stackId="a" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
