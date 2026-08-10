import {
  DATA_END_TIME,
  DEMO_LIVE_TELEMETRY,
  TELEMETRY_INTERVAL_MS,
  TELEMETRY_POINTS_PER_DAY,
} from './constants'

/** Shared timestamp axis for all generated series — single source of truth. */
export function resolveCurrentTelemetryIndex(
  timestamps: readonly string[],
): number {
  if (timestamps.length === 0) return 0

  const lastIndex = timestamps.length - 1
  const endMs = new Date(timestamps[lastIndex]!).getTime()
  const intervalMs = TELEMETRY_INTERVAL_MS
  const now = Date.now()

  if (!DEMO_LIVE_TELEMETRY) {
    return lastIndex
  }

  if (now <= endMs) {
    return findIndexAtOrBefore(timestamps, now)
  }

  // After the dataset anchor: advance one slot every interval, cycling the last day.
  const elapsedSlots = Math.floor((now - endMs) / intervalMs)
  const lastDayStart = Math.max(0, timestamps.length - TELEMETRY_POINTS_PER_DAY)
  return lastDayStart + (elapsedSlots % TELEMETRY_POINTS_PER_DAY)
}

export function resolveCurrentTelemetryTimestamp(
  timestamps: readonly string[],
): string {
  const index = resolveCurrentTelemetryIndex(timestamps)
  return timestamps[index] ?? timestamps[timestamps.length - 1] ?? DATA_END_TIME
}

export function msUntilNextTelemetryTick(): number {
  const now = Date.now()
  const elapsed = now % TELEMETRY_INTERVAL_MS
  return elapsed === 0 ? TELEMETRY_INTERVAL_MS : TELEMETRY_INTERVAL_MS - elapsed
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
