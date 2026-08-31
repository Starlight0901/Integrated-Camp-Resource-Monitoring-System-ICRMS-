import type { TelemetryPoint } from '@/types'
import { getCalendarDayTicks } from '@/utils/dates'
import {
  formatChartAxisDate,
  formatChartTooltipTimestamp,
  formatTelemetryByUnit,
  formatYAxisTick,
} from '@/utils/formatting'

export interface TelemetryStats {
  current: number
  min: number
  max: number
  average: number
}

export interface ChartSeriesPoint {
  timestamp: string
  timestampMs: number
  value: number
}

export function buildChartSeries(points: TelemetryPoint[]): ChartSeriesPoint[] {
  return points.map((point) => ({
    timestamp: point.timestamp,
    timestampMs: new Date(point.timestamp).getTime(),
    value: point.value,
  }))
}

export function computeTelemetryStats(
  points: TelemetryPoint[],
  currentValue: number,
): TelemetryStats {
  if (points.length === 0) {
    return { current: currentValue, min: currentValue, max: currentValue, average: currentValue }
  }

  let min = points[0]!.value
  let max = points[0]!.value
  let sum = 0

  for (const point of points) {
    min = Math.min(min, point.value)
    max = Math.max(max, point.value)
    sum += point.value
  }

  return {
    current: currentValue,
    min,
    max,
    average: sum / points.length,
  }
}

export function resolveSeriesCurrentValue(
  points: TelemetryPoint[],
  index: number,
  fallback: number,
): number {
  if (points.length === 0) return fallback
  const clamped = Math.max(0, Math.min(index, points.length - 1))
  return points[clamped]?.value ?? fallback
}

export function buildDayAxisTicks(points: TelemetryPoint[]): number[] {
  if (points.length === 0) return []

  const startMs = new Date(points[0]!.timestamp).getTime()
  const endMs = new Date(points[points.length - 1]!.timestamp).getTime()
  return getCalendarDayTicks(startMs, endMs)
}

export const formatAxisTick = formatChartAxisDate
export const formatTooltipTimestamp = formatChartTooltipTimestamp
export const formatChartValue = formatTelemetryByUnit
export { formatYAxisTick }
