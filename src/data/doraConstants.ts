import type { DoraLocation, DoraReadings, DoraResourceKey } from '@/types'

export const DORA_FUEL_UNIT = 'L'
export const DORA_POWER_UNIT = 'kVA'

export const DORA_RESOURCE_RANGES = {
  fuelLevel: { min: 0, max: 2000, unit: DORA_FUEL_UNIT },
  powerConsumption: { min: 0, max: 40, unit: DORA_POWER_UNIT },
} as const

export const DORA_RESOURCE_DEFINITIONS: Record<
  DoraResourceKey,
  { label: string; unit: string }
> = {
  fuelLevel: { label: 'Generator Fuel Level', unit: DORA_FUEL_UNIT },
  powerConsumption: { label: 'Power Consumption', unit: DORA_POWER_UNIT },
}

export const DORA_RESOURCE_ORDER: readonly DoraResourceKey[] = [
  'fuelLevel',
  'powerConsumption',
]

/**
 * Central DORA-only thresholds. Edit these values to retune demo status.
 * Independent of camp ALARM_THRESHOLDS / METRIC_RANGES.
 *
 * Fuel (0–2000 L): low tank is worse.
 * Power (0–40 kVA): high generator load is worse.
 */
export const DORA_STATUS_THRESHOLDS = {
  fuelLevel: { warning: 500, critical: 200 },
  powerConsumption: { warning: 32, critical: 38 },
} as const

/** Rolling 7-day DORA history (independent of camp telemetry constants). */
export const DORA_HISTORY_DAYS = 7
export const DORA_HISTORY_INTERVAL_MS = 5 * 60 * 1000
export const DORA_HISTORY_POINTS_PER_DAY = 24 * 12
export const DORA_HISTORY_POINT_COUNT =
  DORA_HISTORY_DAYS * DORA_HISTORY_POINTS_PER_DAY

/**
 * DORA live simulator — independent of camp LIVE_SIMULATOR_INTERVAL_MS.
 * Production/demo cadence is 60 seconds.
 */
export const DORA_LIVE_TELEMETRY_SIMULATOR = true
export const DORA_LIVE_SIMULATOR_INTERVAL_MS = 60_000

/** Max absolute live step per minute (much smaller than historical variance). */
export const DORA_LIVE_MAX_DELTA = {
  fuelLevel: 12,
  powerConsumption: 1.8,
} as const

export interface DoraDemoSeed {
  id: string
  name: string
  location: DoraLocation
  readings: DoraReadings
}

/**
 * Representative demo GPS only — fictional coastal-water points around
 * Sri Lanka. Not operational Navy locations and not camp coordinates.
 */
export const DORA_DEMO_SEEDS: readonly DoraDemoSeed[] = [
  {
    id: 'dora-01',
    name: 'DORA 01',
    location: { latitude: 6.42, longitude: 79.72 },
    readings: { fuelLevel: 1720, powerConsumption: 14.5 },
  },
  {
    id: 'dora-02',
    name: 'DORA 02',
    location: { latitude: 7.88, longitude: 79.58 },
    readings: { fuelLevel: 1180, powerConsumption: 22.0 },
  },
  {
    id: 'dora-03',
    name: 'DORA 03',
    location: { latitude: 8.41, longitude: 81.08 },
    readings: { fuelLevel: 420, powerConsumption: 19.5 },
  },
  {
    id: 'dora-04',
    name: 'DORA 04',
    location: { latitude: 9.18, longitude: 80.82 },
    readings: { fuelLevel: 980, powerConsumption: 33.2 },
  },
  {
    id: 'dora-05',
    name: 'DORA 05',
    location: { latitude: 6.12, longitude: 81.42 },
    readings: { fuelLevel: 85, powerConsumption: 11.0 },
  },
  {
    id: 'dora-06',
    name: 'DORA 06',
    location: { latitude: 5.92, longitude: 80.08 },
    readings: { fuelLevel: 1560, powerConsumption: 38.8 },
  },
]
