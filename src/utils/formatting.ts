import type { Metric, MetricKey } from '@/types'

/** Consistent locale for Sri Lanka demo timestamps. */
const LOCALE = 'en-LK'

export function formatTelemetryValue(key: MetricKey, value: number): string {
  switch (key) {
    case 'fuelLevel':
      return Math.round(value).toLocaleString(LOCALE)
    case 'waterLevel':
      return value.toFixed(2)
    case 'temperature':
      return value.toFixed(1)
    case 'apparentPower':
      return value.toFixed(1)
  }
}

export function formatTelemetryByUnit(value: number, unit: string): string {
  if (unit === 'L') return `${Math.round(value).toLocaleString(LOCALE)} ${unit}`
  if (unit === 'm³') return `${value.toFixed(2)} ${unit}`
  if (unit === '°C') return `${value.toFixed(1)} ${unit}`
  return `${value.toFixed(1)} ${unit}`
}

export function formatMetricValue(metric: Metric): string {
  return formatTelemetryValue(metric.key, metric.value)
}

export function formatMetricDisplay(metric: Metric): string {
  return `${formatMetricValue(metric)} ${metric.unit}`
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatChartAxisDate(timestampMs: number): string {
  return new Date(timestampMs).toLocaleString(LOCALE, {
    month: 'short',
    day: 'numeric',
  })
}

export function formatChartTooltipTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString(LOCALE, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatYAxisTick(value: number, unit: string): string {
  if (unit === 'L' && value >= 1000) return `${Math.round(value / 1000)}k`
  if (unit === 'm³') return value.toFixed(0)
  if (unit === '°C') return value.toFixed(1)
  return String(Math.round(value))
}

/** Short geographic label — "Colombo Camp" → "Colombo". */
export function shortCampLabel(name: string): string {
  return name.replace(/\s+Camp$/i, '')
}

export const METRIC_SHORT_LABELS: Record<MetricKey, string> = {
  apparentPower: 'Power',
  temperature: 'Temp',
  waterLevel: 'Water',
  fuelLevel: 'Fuel',
}
