import {
  dummyTelemetry,
  getLiveTelemetrySnapshot,
  telemetryTimestamps,
} from '@/data/generateDataset'
import {
  LIVE_SIMULATOR_INTERVAL_MS,
  LIVE_TELEMETRY_SIMULATOR,
  TELEMETRY_DAYS,
  TELEMETRY_INTERVAL_MS,
} from '@/data/constants'
import {
  getTelemetryRefreshIntervalMs,
  msUntilNextTelemetryTick,
  resolveCurrentTelemetryIndex,
} from '@/data/telemetryClock'
import { telemetryValueAt } from '@/data/telemetryGenerators'
import type {
  Alarm,
  Camp,
  MetricKey,
  TelemetryPoint,
} from '@/types'
import type {
  CurrentTelemetry,
  HistoricalTelemetry,
  TelemetryRange,
  TelemetryService,
} from './telemetryService.types'

const SIMULATED_LATENCY_MS = 150

const RANGE_MS: Record<TelemetryRange, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
  '7d': TELEMETRY_DAYS * 24 * 60 * 60 * 1000,
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), SIMULATED_LATENCY_MS)
  })
}

function snapshot() {
  return getLiveTelemetrySnapshot()
}

function filterPointsByRange(
  points: TelemetryPoint[],
  range: TelemetryRange,
): TelemetryPoint[] {
  if (points.length === 0) return []

  const endMs = new Date(points[points.length - 1]!.timestamp).getTime()
  const startMs = endMs - RANGE_MS[range]

  return points.filter(
    (point) => new Date(point.timestamp).getTime() >= startMs,
  )
}

function resolveCurrentReading(
  campId: string,
  metric: MetricKey,
): { value: number; timestamp: string } {
  const index = resolveCurrentTelemetryIndex(telemetryTimestamps)
  const timestamp = telemetryTimestamps[index] ?? telemetryTimestamps.at(-1)!
  const series = dummyTelemetry.find(
    (entry) => entry.campId === campId && entry.metric === metric,
  )

  if (!series || series.points.length === 0) {
    return { value: 0, timestamp }
  }

  return {
    value: telemetryValueAt(series.points, index),
    timestamp,
  }
}

/**
 * Deterministic demo implementation backed by the seeded telemetry generator.
 * When LIVE_TELEMETRY_SIMULATOR is on, readings append once per minute.
 * Replace with `apiTelemetryService` when connecting to a real backend.
 */
export class DummyTelemetryService implements TelemetryService {
  async getCamps(): Promise<Camp[]> {
    const { camps } = snapshot()
    return delay(camps.map((camp) => ({ ...camp })))
  }

  async getCamp(campId: string): Promise<Camp | null> {
    const camp = snapshot().camps.find((entry) => entry.id === campId) ?? null
    return delay(camp ? { ...camp } : null)
  }

  async getCurrentTelemetry(campId: string): Promise<CurrentTelemetry | null> {
    const camp = snapshot().camps.find((entry) => entry.id === campId) ?? null
    if (!camp) return delay(null)

    return delay({
      campId: camp.id,
      timestamp: camp.lastUpdated,
      metrics: camp.metrics,
    })
  }

  async getHistoricalTelemetry(
    campId: string,
    metric: MetricKey,
    range: TelemetryRange = '7d',
  ): Promise<HistoricalTelemetry> {
    // Ensure live points are appended before serving history
    snapshot()

    const series = dummyTelemetry.find(
      (entry) => entry.campId === campId && entry.metric === metric,
    )
    const points = series ? filterPointsByRange(series.points, range) : []
    const { value, timestamp } = resolveCurrentReading(campId, metric)

    return delay({
      campId,
      metric,
      range,
      points: [...points],
      currentValue: value,
      currentTimestamp: timestamp,
    })
  }

  async getActiveAlarms(campId?: string): Promise<Alarm[]> {
    const alarms = campId
      ? snapshot().alarms.filter((alarm) => alarm.campId === campId)
      : snapshot().alarms
    return delay([...alarms])
  }

  getMsUntilNextRefresh(): number {
    return msUntilNextTelemetryTick()
  }
}

/** Singleton dummy implementation — swap export in `services/index.ts` for API later. */
export const dummyTelemetryService = new DummyTelemetryService()

export {
  TELEMETRY_INTERVAL_MS,
  LIVE_SIMULATOR_INTERVAL_MS,
  LIVE_TELEMETRY_SIMULATOR,
  getTelemetryRefreshIntervalMs,
}
