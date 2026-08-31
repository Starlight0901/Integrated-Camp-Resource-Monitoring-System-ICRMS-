import {
  DEMO_LIVE_TELEMETRY,
  LIVE_SIMULATOR_INTERVAL_MS,
  LIVE_TELEMETRY_SIMULATOR,
  TELEMETRY_INTERVAL_MS,
  TELEMETRY_POINTS_PER_DAY,
} from './constants'
import { getCurrentDate } from '@/utils/dates'
import { msUntilNextLiveSimulatorTick } from './liveTelemetrySimulator'

/** Shared timestamp axis for all generated series — single source of truth. */
export function resolveCurrentTelemetryIndex(
  timestamps: readonly string[],
): number {
  if (timestamps.length === 0) return 0

  const lastIndex = timestamps.length - 1
  const endMs = new Date(timestamps[lastIndex]!).getTime()
  const intervalMs = TELEMETRY_INTERVAL_MS
  const now = getCurrentDate().getTime()

  // Live simulator appends points; current reading is always the newest.
  if (LIVE_TELEMETRY_SIMULATOR || !DEMO_LIVE_TELEMETRY) {
    return lastIndex
  }

  if (now <= endMs) {
    return findIndexAtOrBefore(timestamps, now)
  }

  // Legacy DEMO_LIVE_TELEMETRY: cycle the last day of fixed history.
  const elapsedSlots = Math.floor((now - endMs) / intervalMs)
  const lastDayStart = Math.max(0, timestamps.length - TELEMETRY_POINTS_PER_DAY)
  return lastDayStart + (elapsedSlots % TELEMETRY_POINTS_PER_DAY)
}

export function resolveCurrentTelemetryTimestamp(
  timestamps: readonly string[],
): string {
  const index = resolveCurrentTelemetryIndex(timestamps)
  return (
    timestamps[index] ??
    timestamps[timestamps.length - 1] ??
    getCurrentDate().toISOString()
  )
}

export function msUntilNextTelemetryTick(): number {
  if (LIVE_TELEMETRY_SIMULATOR) {
    return msUntilNextLiveSimulatorTick()
  }

  const now = getCurrentDate().getTime()
  const elapsed = now % TELEMETRY_INTERVAL_MS
  return elapsed === 0 ? TELEMETRY_INTERVAL_MS : TELEMETRY_INTERVAL_MS - elapsed
}

/** Active UI refresh cadence — live simulator interval when enabled. */
export function getTelemetryRefreshIntervalMs(): number {
  return LIVE_TELEMETRY_SIMULATOR
    ? LIVE_SIMULATOR_INTERVAL_MS
    : TELEMETRY_INTERVAL_MS
}

function findIndexAtOrBefore(
  timestamps: readonly string[],
  targetMs: number,
): number {
  let low = 0
  let high = timestamps.length - 1
  let result = 0

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const midMs = new Date(timestamps[mid]!).getTime()

    if (midMs <= targetMs) {
      result = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return result
}
