import { useEffect, useMemo, useId } from 'react'
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
import { X } from 'lucide-react'
import type { Camp, Metric, TelemetryPoint } from '@/types'
import { ChartSkeleton, ErrorState, NoDataState } from '@/components/ui'
import { METRIC_DISPLAY_CONFIG } from '@/utils/metricConfig'
import { metricStatusForCamp } from '@/utils/metricStatus'
import { cn } from '@/utils'
import { getTelemetrySeriesColor, useChartTheme } from '@/theme'
import {
  buildChartSeries,
  buildDayAxisTicks,
  computeTelemetryStats,
  formatAxisTick,
  formatChartValue,
  formatTooltipTimestamp,
  formatYAxisTick,
} from './telemetryChartUtils'

export interface TelemetryHistoryModalProps {
  open: boolean
  onClose: () => void
  camp: Camp
  metric: Metric
  historicalData: TelemetryPoint[]
  currentValue: number
  unit: string
  min: number
  max: number
  loading?: boolean
  error?: string | null
}

type MetricSeverity = ReturnType<typeof metricStatusForCamp>

interface StatItemProps {
  label: string
  value: string
  variant?: 'default' | 'current'
  severity?: MetricSeverity
}

function currentValueColorClass(severity: MetricSeverity): string {
  if (severity === 'critical') return 'text-cw-status-critical'
  if (severity === 'warning') return 'text-cw-status-warning'
  return 'text-cw-text'
}

function StatItem({
  label,
  value,
  variant = 'default',
  severity = 'online',
}: StatItemProps) {
  const isCurrent = variant === 'current'

  return (
    <div
      className={cn(
        'rounded-cw-md border px-4 py-3',
        isCurrent
          ? 'border-cw-border bg-cw-bg-elevated'
          : 'border-cw-border-subtle bg-cw-surface',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-cw-text-dim">
        {label}
      </p>
      <p
        className={cn(
          'cw-telemetry-value mt-1 text-lg font-semibold',
          isCurrent ? currentValueColorClass(severity) : 'text-cw-text-muted',
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function TelemetryHistoryModal({
  open,
  onClose,
  camp,
  metric,
  historicalData,
  currentValue,
  unit,
  min,
  max,
  loading = false,
  error = null,
}: TelemetryHistoryModalProps) {
  const gradientId = useId().replace(/:/g, '')
  const chartTheme = useChartTheme()

  const metricConfig = METRIC_DISPLAY_CONFIG[metric.key]
  const seriesColor = getTelemetrySeriesColor(metricConfig.chartSeries, chartTheme)

  const chartSeries = useMemo(
    () => buildChartSeries(historicalData),
    [historicalData],
  )
  const axisTicks = useMemo(
    () => buildDayAxisTicks(historicalData),
    [historicalData],
  )
  const stats = useMemo(
    () => computeTelemetryStats(historicalData, currentValue),
    [historicalData, currentValue],
  )
  const currentSeverity = metricStatusForCamp(metric.key, stats.current)
  const lastPoint = chartSeries[chartSeries.length - 1]

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const MetricIcon = metricConfig.icon

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close telemetry history"
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--cw-overlay-backdrop)' }}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="telemetry-history-title"
        className={cn(
          'relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden',
          'rounded-cw-lg border border-cw-border-subtle bg-cw-surface shadow-cw-elevated animate-cw-fade-in',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-cw-border-subtle px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-cw-md border border-cw-border-subtle bg-cw-bg-elevated text-cw-text-muted">
              <MetricIcon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2
                id="telemetry-history-title"
                className="text-xl font-semibold text-cw-text"
              >
                {metric.label}
              </h2>
              <p className="mt-0.5 text-sm text-cw-text-muted">{camp.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-cw-md border border-cw-border-subtle p-2 text-cw-text-muted transition-colors hover:border-cw-border hover:bg-cw-surface-hover hover:text-cw-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {!loading && !error && chartSeries.length > 0 && (
          <div className="grid grid-cols-2 gap-3 border-b border-cw-border-subtle px-6 py-4 sm:grid-cols-4">
            <StatItem
              label="Current"
              value={formatChartValue(stats.current, unit)}
              variant="current"
              severity={currentSeverity}
            />
            <StatItem label="Minimum" value={formatChartValue(stats.min, unit)} />
            <StatItem label="Average" value={formatChartValue(stats.average, unit)} />
            <StatItem label="Maximum" value={formatChartValue(stats.max, unit)} />
          </div>
        )}

        <div className="flex-1 overflow-auto px-6 py-5">
          {loading ? (
            <ChartSkeleton />
          ) : error ? (
            <ErrorState
              compact
              title="Unable to load historical telemetry"
              description={error}
            />
          ) : chartSeries.length === 0 ? (
            <NoDataState compact />
          ) : (
            <div
              className="h-[420px] w-full min-w-0 rounded-cw-md border border-cw-border-subtle"
              style={{ backgroundColor: chartTheme.background }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartSeries}
                  margin={{ top: 20, right: 24, left: 8, bottom: 12 }}
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
                    cursor={{
                      stroke: chartTheme.cursor,
                      strokeWidth: 1,
                    }}
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
                      return entry
                        ? formatTooltipTimestamp(entry.timestamp)
                        : ''
                    }}
                    formatter={(value) => {
                      const numeric =
                        typeof value === 'number' ? value : Number(value)
                      return [formatChartValue(numeric, unit), metric.label]
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
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cw-border-subtle px-6 py-3 text-xs text-cw-text-dim">
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-4 rounded-full"
              style={{ backgroundColor: seriesColor }}
              aria-hidden
            />
            <span>Historical trend</span>
          </span>
          <span>Data interval: 5 minutes</span>
          <span>Period: Last 7 days</span>
        </div>
      </div>
    </div>
  )
}
