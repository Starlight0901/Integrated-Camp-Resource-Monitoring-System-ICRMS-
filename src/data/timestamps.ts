import {
  DATA_END_TIME,
  TELEMETRY_INTERVAL_MS,
  TELEMETRY_POINT_COUNT,
} from './constants'

export function generateTimestamps(): string[] {
  const endMs = new Date(DATA_END_TIME).getTime()
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
