import type { Alarm, Camp, CampTelemetrySeries, MetricKey } from '@/types'
import { CAMP_PROFILES, DEFAULT_ENERGY_CONSUMPTION } from './constants'
import { buildCampMetrics } from './helpers'
import { deriveAlarmsFromCamps } from './alarmDerivation'
import {
  enrichCampsWithOperationalStatus,
  getOfflineCampIds,
} from './campOperationalStatus'
import { resolveCurrentTelemetryIndex } from './telemetryClock'

const METRIC_KEYS: MetricKey[] = [
  'apparentPower',
  'temperature',
  'waterLevel',
  'fuelLevel',
]

const offlineByCampId = getOfflineCampIds(CAMP_PROFILES)

export function telemetryValueAtIndex(
  points: readonly { value: number }[],
  index: number,
): number {
  if (points.length === 0) return 0
  const clamped = Math.max(0, Math.min(index, points.length - 1))
  return points[clamped]!.value
}

function buildRawCampsAtIndex(
  telemetry: CampTelemetrySeries[],
  timestamps: readonly string[],
  index: number,
): Camp[] {
  const lastUpdated = timestamps[index] ?? timestamps[timestamps.length - 1]!

  return CAMP_PROFILES.map((profile) => {
    const values = Object.fromEntries(
      METRIC_KEYS.map((metric) => {
        const series = telemetry.find(
          (entry) => entry.campId === profile.id && entry.metric === metric,
        )
        const points = series?.points ?? []
        return [metric, telemetryValueAtIndex(points, index)]
      }),
    ) as Record<MetricKey, number>

    return {
      id: profile.id,
      name: profile.name,
      location: profile.location,
      latitude: profile.latitude,
      longitude: profile.longitude,
      image: profile.image,
      status: 'online' as const,
      lastUpdated,
      metrics: buildCampMetrics(values),
      energyConsumption:
        profile.energyConsumption ?? DEFAULT_ENERGY_CONSUMPTION,
    }
  })
}

export function buildCampsAtTelemetryIndex(
  telemetry: CampTelemetrySeries[],
  timestamps: readonly string[],
  index: number,
): Camp[] {
  const rawCamps = buildRawCampsAtIndex(telemetry, timestamps, index)
  const alarms = deriveAlarmsFromCamps(rawCamps, telemetry)
  return enrichCampsWithOperationalStatus(rawCamps, alarms, offlineByCampId)
}

export function buildAlarmsAtTelemetryIndex(
  telemetry: CampTelemetrySeries[],
  timestamps: readonly string[],
  index: number,
): Alarm[] {
  const rawCamps = buildRawCampsAtIndex(telemetry, timestamps, index)
  return deriveAlarmsFromCamps(rawCamps, telemetry)
}

export function resolveLiveCampsSnapshot(
  telemetry: CampTelemetrySeries[],
  timestamps: readonly string[],
): { camps: Camp[]; alarms: Alarm[]; index: number; timestamp: string } {
  const index = resolveCurrentTelemetryIndex(timestamps)
  const rawCamps = buildRawCampsAtIndex(telemetry, timestamps, index)
  const alarms = deriveAlarmsFromCamps(rawCamps, telemetry)
  const camps = enrichCampsWithOperationalStatus(rawCamps, alarms, offlineByCampId)

  return {
    camps,
    alarms,
    index,
    timestamp: timestamps[index] ?? timestamps[timestamps.length - 1]!,
  }
}
