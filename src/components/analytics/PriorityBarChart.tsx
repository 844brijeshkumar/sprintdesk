import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { PriorityDistributionItem } from '@/utils/analyticsTransformers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CustomChartTooltip } from './ChartTooltip';

export interface PriorityBarChartProps {
  data: PriorityDistributionItem[];
}

export function PriorityBarChart({ data }: PriorityBarChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Tasks by Priority</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Severity distribution of active backlog & in-flight tickets
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
              <XAxis
                dataKey="priority"
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
              <Tooltip
                content={
                  <CustomChartTooltip
                    valueFormatter={(val, _, payloadItem) =>
                      `${val} tasks (${payloadItem?.points || 0} pts)`
                    }
                  />
                }
              />
              <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
