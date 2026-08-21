import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { StatusDistributionItem } from '@/utils/analyticsTransformers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CustomChartTooltip } from './ChartTooltip';

export interface StatusPieChartProps {
  data: StatusDistributionItem[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  const totalTasks = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Status Distribution</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Breakdown of {totalTasks} sprint items across workflow stages
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomChartTooltip
                      valueFormatter={(val, _, payloadItem) =>
                        `${val} tasks (${payloadItem?.points || 0} pts)`
                      }
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 w-full pt-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  {item.value} ({item.points}p)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
