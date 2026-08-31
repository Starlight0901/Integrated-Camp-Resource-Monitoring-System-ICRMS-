import type { Metric, MetricKey } from '@/types'
import { ENERGY_CONSUMPTION_UNIT } from '@/types'
import { APP_TIME_ZONE, formatChartDate } from './dates'

/** Consistent locale for Sri Lanka demo timestamps. */
const LOCALE = 'en-LK'

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: APP_TIME_ZONE,
}

/** Format energy totals with comma separators and the standard kWh unit. */
export function formatEnergyKwh(value: number): string {
  return `${Math.round(value).toLocaleString(LOCALE)} ${ENERGY_CONSUMPTION_UNIT}`
}

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
    ...TIME_OPTIONS,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    ...TIME_OPTIONS,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatChartAxisDate(timestampMs: number): string {
  return formatChartDate(timestampMs)
}

export function formatChartTooltipTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString(LOCALE, {
    ...TIME_OPTIONS,
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
