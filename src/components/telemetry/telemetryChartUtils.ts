import type { TelemetryPoint } from '@/types'
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

const DAY_MS = 24 * 60 * 60 * 1000

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
  const ticks: number[] = []

  const startDate = new Date(startMs)
  startDate.setHours(0, 0, 0, 0)
  let cursor = startDate.getTime()

  if (cursor < startMs) {
    cursor += DAY_MS
  }

  while (cursor <= endMs) {
    ticks.push(cursor)
    cursor += DAY_MS
  }

  if (ticks.length === 0 || ticks[ticks.length - 1]! < endMs) {
    ticks.push(endMs)
  }

  return ticks
}

export const formatAxisTick = formatChartAxisDate
export const formatTooltipTimestamp = formatChartTooltipTimestamp
export const formatChartValue = formatTelemetryByUnit
export { formatYAxisTick }
