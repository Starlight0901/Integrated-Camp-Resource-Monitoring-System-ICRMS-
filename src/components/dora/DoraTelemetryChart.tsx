import { useId, useMemo } from 'react'
import { Fuel, Zap } from 'lucide-react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DoraResourceKey, DoraStatus, TelemetryPoint } from '@/types'
import { Card } from '@/components/ui'
import { cn, formatTelemetryByUnit } from '@/utils'
import {
  buildChartSeries,
  buildDayAxisTicks,
  computeTelemetryStats,
  formatAxisTick,
  formatChartValue,
  formatTooltipTimestamp,
  formatYAxisTick,
} from '@/components/telemetry'
import {
  getTelemetrySeriesColor,
  useChartTheme,
  type TelemetryChartSeries,
} from '@/theme'
import { DORA_RESOURCE_DEFINITIONS, DORA_RESOURCE_RANGES } from '@/data'

const RESOURCE_SERIES: Record<DoraResourceKey, TelemetryChartSeries> = {
  fuelLevel: 'green',
  powerConsumption: 'blue',
}

const RESOURCE_ICON = {
  fuelLevel: Fuel,
  powerConsumption: Zap,
} as const

export interface DoraTelemetryChartProps {
  resource: DoraResourceKey
  points: TelemetryPoint[]
  currentValue: number
  currentStatus: DoraStatus
}

function currentValueColorClass(status: DoraStatus): string {
  if (status === 'critical') return 'text-cw-status-critical'
  if (status === 'warning') return 'text-cw-status-warning'
  return 'text-cw-text'
}

function StatItem({
  label,
  value,
  emphasized,
  status = 'normal',
}: {
  label: string
  value: string
  emphasized?: boolean
  status?: DoraStatus
}) {
  return (
    <div
      className={cn(
        'rounded-cw-md border px-3 py-2.5',
        emphasized
          ? 'border-cw-brand/20 bg-cw-brand-subtle'
          : 'border-cw-border-subtle bg-cw-surface',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-cw-text-dim">
        {label}
      </p>
      <p
        className={cn(
          'cw-telemetry-value mt-1 text-sm font-semibold',
          emphasized ? currentValueColorClass(status) : 'text-cw-text-muted',
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function DoraTelemetryChart({
  resource,
  points,
  currentValue,
  currentStatus,
}: DoraTelemetryChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const chartTheme = useChartTheme()
  const definition = DORA_RESOURCE_DEFINITIONS[resource]
  const seriesColor = getTelemetrySeriesColor(RESOURCE_SERIES[resource], chartTheme)
  const Icon = RESOURCE_ICON[resource]
  const range = DORA_RESOURCE_RANGES[resource]
  const { min, max, unit } = range

  const chartSeries = useMemo(() => buildChartSeries(points), [points])
  const axisTicks = useMemo(() => buildDayAxisTicks(points), [points])
  const stats = useMemo(
    () => computeTelemetryStats(points, currentValue),
    [points, currentValue],
  )
  const lastPoint = chartSeries[chartSeries.length - 1]

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-start gap-3 border-b border-cw-border-subtle px-4 py-4 sm:px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-cw-md border border-cw-border-subtle bg-cw-bg-elevated text-cw-text-muted">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-cw-text">{definition.label}</h3>
          <p className="mt-0.5 text-xs text-cw-text-muted">Last 7 days · {unit}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-cw-border-subtle px-4 py-3 sm:grid-cols-4 sm:px-5">
        <StatItem
          label="Current"
          value={formatTelemetryByUnit(stats.current, unit)}
          emphasized
          status={currentStatus}
        />
        <StatItem label="Minimum" value={formatTelemetryByUnit(stats.min, unit)} />
        <StatItem label="Average" value={formatTelemetryByUnit(stats.average, unit)} />
        <StatItem label="Maximum" value={formatTelemetryByUnit(stats.max, unit)} />
      </div>

      <div
        className="h-[280px] w-full min-w-0 px-1 pt-2 sm:h-[340px]"
        style={{ backgroundColor: chartTheme.background }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartSeries}
            margin={{ top: 16, right: 20, left: 4, bottom: 8 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={seriesColor} stopOpacity={0.18} />
                <stop offset="100%" stopColor={seriesColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={chartTheme.grid}
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="timestampMs"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={axisTicks}
              tickFormatter={formatAxisTick}
              tick={{ fill: chartTheme.axisLabel, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: chartTheme.axis, strokeWidth: 1 }}
              minTickGap={32}
            />
            <YAxis
              domain={[min, max]}
              tickFormatter={(value: number) => formatYAxisTick(value, unit)}
              tick={{ fill: chartTheme.axisLabel, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ stroke: chartTheme.cursor, strokeWidth: 1 }}
              contentStyle={{
                background: chartTheme.tooltipBackground,
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '0.5rem',
                fontSize: '12px',
                padding: '8px 12px',
                boxShadow: chartTheme.tooltipShadow,
              }}
              labelStyle={{
                color: chartTheme.tooltipLabel,
                marginBottom: 4,
                fontSize: 11,
              }}
              itemStyle={{ color: seriesColor, fontWeight: 600 }}
              labelFormatter={(_, payload) => {
                const entry = payload?.[0]?.payload as
                  | { timestamp: string }
                  | undefined
                return entry ? formatTooltipTimestamp(entry.timestamp) : ''
              }}
              formatter={(value) => {
                const numeric = typeof value === 'number' ? value : Number(value)
                return [formatChartValue(numeric, unit), definition.label]
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              fill={`url(#${gradientId})`}
              stroke="none"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={seriesColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 4,
                fill: seriesColor,
                stroke: chartTheme.activeDotStroke,
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
            {lastPoint && (
              <ReferenceDot
                x={lastPoint.timestampMs}
                y={stats.current}
                r={5}
                fill={seriesColor}
                stroke={chartTheme.activeDotStroke}
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cw-border-subtle px-4 py-3 text-[11px] text-cw-text-dim sm:px-5">
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-4 rounded-full"
            style={{ backgroundColor: seriesColor }}
            aria-hidden
          />
          Historical trend
        </span>
        <span>History interval: 5 min · live 60 s</span>
        <span>Period: Last 7 days</span>
      </div>
    </Card>
  )
}
