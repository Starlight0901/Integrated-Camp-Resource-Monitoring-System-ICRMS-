import type { DoraResourceKey, TelemetryPoint } from '@/types'
import {
  DORA_HISTORY_DAYS,
  DORA_HISTORY_INTERVAL_MS,
  DORA_HISTORY_POINT_COUNT,
} from './doraConstants'
import {
  floorToInterval,
  getCurrentDate,
  getSevenDayRange,
} from '@/utils/dates'

/** Rolling 7-day axis at 5-minute resolution, ending at the current 5-minute slot. */
export function getDoraHistoricalTimestamps(
  now: Date = getCurrentDate(),
): string[] {
  const { end } = getSevenDayRange(now, DORA_HISTORY_DAYS)
  const endMs = floorToInterval(end.getTime(), DORA_HISTORY_INTERVAL_MS)
  const startMs = endMs - (DORA_HISTORY_POINT_COUNT - 1) * DORA_HISTORY_INTERVAL_MS
  const timestamps: string[] = []

  for (let i = 0; i < DORA_HISTORY_POINT_COUNT; i++) {
    timestamps.push(new Date(startMs + i * DORA_HISTORY_INTERVAL_MS).toISOString())
  }

  return timestamps
}

export interface DoraTelemetrySeries {
  doraId: string
  resource: DoraResourceKey
  points: TelemetryPoint[]
}
