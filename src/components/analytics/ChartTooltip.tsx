export interface ChartTooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
  stroke?: string;
  dataKey?: string;
  payload?: Record<string, any>;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
  valueFormatter?: (value: any, name: string, payloadItem: any) => string;
}

export function CustomChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-white text-xs min-w-[160px] z-50 pointer-events-none text-left">
      {label && (
        <div className="mb-2 pb-1.5 border-b border-slate-800 font-semibold text-slate-200">
          {label}
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const color = entry.color || entry.fill || entry.stroke || '#3b82f6';
          const name = entry.name || entry.dataKey || 'Value';
          const formattedValue = valueFormatter
            ? valueFormatter(entry.value, name, entry.payload)
            : `${entry.value}`;

          return (
            <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-300 truncate">{name}</span>
              </div>
              <span className="font-semibold text-white font-mono shrink-0">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
