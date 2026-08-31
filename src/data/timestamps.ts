import {
  TELEMETRY_DAYS,
  TELEMETRY_INTERVAL_MS,
  TELEMETRY_POINT_COUNT,
} from './constants'
import {
  floorToInterval,
  getCurrentDate,
  getSevenDayRange,
} from '@/utils/dates'

/**
 * Rolling 7-day axis at 5-minute resolution, ending at the current 5-minute slot.
 * Never emits timestamps after `now`.
 */
export function generateTimestamps(now: Date = getCurrentDate()): string[] {
  return getHistoricalTimestamps(now)
}

export function getHistoricalTimestamps(now: Date = getCurrentDate()): string[] {
  const { end } = getSevenDayRange(now, TELEMETRY_DAYS)
  const endMs = floorToInterval(end.getTime(), TELEMETRY_INTERVAL_MS)
  const startMs = endMs - (TELEMETRY_POINT_COUNT - 1) * TELEMETRY_INTERVAL_MS
  const timestamps: string[] = []

  for (let i = 0; i < TELEMETRY_POINT_COUNT; i++) {
    timestamps.push(new Date(startMs + i * TELEMETRY_INTERVAL_MS).toISOString())
  }

  return timestamps
}

export function latestTimestamp(timestamps: string[]): string {
  return timestamps[timestamps.length - 1]!
}
