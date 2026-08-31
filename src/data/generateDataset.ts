import type { Alarm, Camp, CampTelemetrySeries, MetricKey } from '@/types'
import { CAMP_PROFILES, TELEMETRY_POINT_COUNT } from './constants'
import {
  generateApparentPowerSeries,
  generateFuelSeries,
  generateTemperatureSeries,
  generateWaterTankSeries,
} from './telemetryGenerators'
import { generateTimestamps } from './timestamps'
import { resolveLiveCampsSnapshot } from './telemetrySnapshot'
import { advanceLiveTelemetryIfDue } from './liveTelemetrySimulator'

const METRIC_KEYS: MetricKey[] = [
  'apparentPower',
  'temperature',
  'waterLevel',
  'fuelLevel',
]

export const telemetryTimestamps = generateTimestamps()

if (import.meta.env.DEV) {
  const firstMs = new Date(telemetryTimestamps[0]!).getTime()
  const lastMs = new Date(telemetryTimestamps[telemetryTimestamps.length - 1]!).getTime()
  const nowMs = Date.now()
  if (lastMs > nowMs + 60_000) {
    console.warn('[ICRMS] Historical timestamps extend more than a minute into the future')
  }
  const spanDays = (lastMs - firstMs) / (24 * 60 * 60 * 1000)
  if (spanDays < 6.9 || spanDays > 7.05) {
    console.warn(
      `[ICRMS] Historical span is ${spanDays.toFixed(2)} days; expected ~7`,
    )
  }
}

function generateSeriesForCamp(
  profile: (typeof CAMP_PROFILES)[number],
): CampTelemetrySeries[] {
  const generators = {
    apparentPower: generateApparentPowerSeries,
    temperature: generateTemperatureSeries,
    waterLevel: generateWaterTankSeries,
    fuelLevel: generateFuelSeries,
  } as const

  return METRIC_KEYS.map((metric) => ({
    campId: profile.id,
    metric,
    points: generators[metric](profile, telemetryTimestamps),
  }))
}

export const dummyTelemetry: CampTelemetrySeries[] = CAMP_PROFILES.flatMap(
  generateSeriesForCamp,
)

const liveSnapshot = resolveLiveCampsSnapshot(dummyTelemetry, telemetryTimestamps)

export const dummyCamps: Camp[] = liveSnapshot.camps
export const dummyAlarms: Alarm[] = liveSnapshot.alarms

export function getLiveTelemetrySnapshot() {
  advanceLiveTelemetryIfDue(dummyTelemetry, telemetryTimestamps)
  return resolveLiveCampsSnapshot(dummyTelemetry, telemetryTimestamps)
}

if (import.meta.env.DEV) {
  for (const series of dummyTelemetry) {
    if (series.points.length !== TELEMETRY_POINT_COUNT) {
      console.warn(
        `[ICRMS] Expected ${TELEMETRY_POINT_COUNT} points for ${series.campId}/${series.metric}, got ${series.points.length}`,
      )
    }
  }

  const statusCounts = dummyCamps.reduce(
    (acc, camp) => {
      acc[camp.status] = (acc[camp.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  const expected = { online: 2, warning: 1, critical: 1 }
  for (const [status, count] of Object.entries(expected)) {
    if (statusCounts[status] !== count) {
      console.warn(
        `[ICRMS] Demo status mismatch: expected ${count} "${status}", got ${statusCounts[status] ?? 0}`,
        dummyCamps.map((c) => ({ id: c.id, status: c.status })),
      )
    }
  }
}
