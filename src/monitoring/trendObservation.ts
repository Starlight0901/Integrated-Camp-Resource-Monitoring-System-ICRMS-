import type { MetricKey, TelemetryPoint } from '@/types'
import { METRIC_RANGES } from '@/data/constants'
import { getColomboHour } from '@/utils/dates'
import type { ResourceStatus } from './types'

const MIN_POINTS = 12
const DAY_MS = 24 * 60 * 60 * 1000

function windowLast24h(points: TelemetryPoint[]): TelemetryPoint[] {
  if (points.length === 0) return []
  const end = new Date(points[points.length - 1]!.timestamp).getTime()
  if (Number.isNaN(end)) return []
  const start = end - DAY_MS
  return points.filter((point) => {
    const time = new Date(point.timestamp).getTime()
    return !Number.isNaN(time) && time >= start
  })
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Short deterministic trend notes from existing 24h history.
 * Returns null when the series is too short or the pattern is not clear.
 */
export function observeMetricTrend(
  metric: MetricKey,
  points: TelemetryPoint[],
  status: ResourceStatus,
): string | null {
  const window = windowLast24h(points)
  if (window.length < MIN_POINTS) return null

  const values = window.map((point) => point.value)
  const first = values[0]!
  const last = values[values.length - 1]!
  const change = last - first
  const range = METRIC_RANGES[metric]
  const span = Math.max(range.max - range.min, 1)
  const relative = Math.abs(change) / (metric === 'fuelLevel' || metric === 'waterLevel' ? range.max : span)

  let downSteps = 0
  let upSteps = 0
  for (let i = 1; i < values.length; i++) {
    const diff = values[i]! - values[i - 1]!
    if (diff < 0) downSteps += 1
    if (diff > 0) upSteps += 1
  }
  const totalSteps = values.length - 1
  const steadilyDown = downSteps / totalSteps >= 0.68 && change < 0 && relative >= 0.08

  if (metric === 'fuelLevel') {
    if (steadilyDown) return 'Fuel has decreased steadily over the last 24 hours.'
    return null
  }

  if (metric === 'waterLevel') {
    if (steadilyDown) return 'Water level has decreased steadily over the last 24 hours.'
    if (status === 'online' && relative < 0.15) {
      return 'Water consumption is within the expected range.'
    }
    return null
  }

  if (metric === 'temperature') {
    if (stdDev(values) <= 0.2) {
      return 'Temperature has remained relatively stable.'
    }
    return null
  }

  const dayValues: number[] = []
  const nightValues: number[] = []
  for (const point of window) {
    const hour = getColomboHour(point.timestamp)
    if (hour >= 8 && hour < 18) dayValues.push(point.value)
    else if (hour >= 20 || hour < 6) nightValues.push(point.value)
  }

  if (dayValues.length >= 8 && nightValues.length >= 8) {
    const dayMean = mean(dayValues)
    const nightMean = mean(nightValues)
    if (nightMean > 0 && dayMean / nightMean >= 1.08) {
      return 'Power demand shows higher daytime usage.'
    }
  }

  return null
}
