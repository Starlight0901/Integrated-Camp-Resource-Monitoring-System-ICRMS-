/** Fixed reference time — keeps all generated data stable across refreshes. */
export const DATA_END_TIME = '2026-08-10T08:00:00.000Z'

/** When true, current readings advance every TELEMETRY_INTERVAL_MS after DATA_END_TIME. */
export const DEMO_LIVE_TELEMETRY = false

/** Sri Lanka standard time offset for diurnal simulation. */
export const SRI_LANKA_UTC_OFFSET_HOURS = 5.5

export const TELEMETRY_INTERVAL_MS = 5 * 60 * 1000
export const TELEMETRY_DAYS = 7
export const TELEMETRY_POINTS_PER_DAY = 24 * 12
export const TELEMETRY_POINT_COUNT =
  TELEMETRY_DAYS * TELEMETRY_POINTS_PER_DAY

export const METRIC_RANGES = {
  apparentPower: { min: 80, max: 200 },
  temperature: { min: 24, max: 26 },
  waterLevel: { min: 1, max: 50 },
  fuelLevel: { min: 1, max: 20000 },
} as const

export const ALARM_THRESHOLDS = {
  fuel: { critical: 2000, warning: 5000 },
  water: { critical: 5, warning: 10 },
  apparentPower: { warning: 190 },
} as const

export interface CampProfile {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  image: string
  seed: number
  basePower: number
  tempOffset: number
  waterStart: number
  waterConsumption: number
  fuelStart: number
  fuelConsumption: number
  refuelIntervalPoints: number
  waterRefillIntervalPoints: number
  /** When true, camp operational status is OFFLINE regardless of telemetry. */
  offline?: boolean
  /** Demo: suppress automatic fuel refuel events (declining fuel scenario). */
  disableFuelRefuel?: boolean
  /** Demo: final fuel level for scripted critical decline (Galle). */
  fuelTargetEnd?: number
}

/** City-level coordinates — demo-tuned for 2 Normal / 1 Warning / 1 Critical. */
export const CAMP_PROFILES: CampProfile[] = [
  {
    id: 'camp-colombo',
    name: 'Colombo Camp',
    location: 'Colombo, Western Province',
    latitude: 6.9271,
    longitude: 79.8612,
    image: '/images/camps/colombo.svg',
    seed: 1101,
    basePower: 148,
    tempOffset: -0.2,
    waterStart: 42,
    waterConsumption: 0.0055,
    fuelStart: 16800,
    fuelConsumption: 3.4,
    refuelIntervalPoints: 2500,
    waterRefillIntervalPoints: 2500,
  },
  {
    id: 'camp-trincomalee',
    name: 'Trincomalee Camp',
    location: 'Trincomalee, Eastern Province',
    latitude: 8.5711,
    longitude: 81.2335,
    image: '/images/camps/trincomalee.svg',
    seed: 2202,
    basePower: 152,
    tempOffset: 0.15,
    waterStart: 44,
    waterConsumption: 0.0075,
    fuelStart: 14200,
    fuelConsumption: 3.6,
    refuelIntervalPoints: 2500,
    waterRefillIntervalPoints: 2500,
  },
  {
    id: 'camp-jaffna',
    name: 'Jaffna Camp',
    location: 'Jaffna, Northern Province',
    latitude: 9.6615,
    longitude: 80.0255,
    image: '/images/camps/jaffna.svg',
    seed: 3303,
    basePower: 136,
    tempOffset: -0.15,
    waterStart: 46,
    waterConsumption: 0.0048,
    fuelStart: 17600,
    fuelConsumption: 3.1,
    refuelIntervalPoints: 2500,
    waterRefillIntervalPoints: 2500,
  },
  {
    id: 'camp-galle',
    name: 'Galle Camp',
    location: 'Galle, Southern Province',
    latitude: 6.0535,
    longitude: 80.221,
    image: '/images/camps/galle.svg',
    seed: 4404,
    basePower: 141,
    tempOffset: -0.18,
    waterStart: 40,
    waterConsumption: 0.0062,
    fuelStart: 18400,
    fuelConsumption: 7.8,
    refuelIntervalPoints: 99999,
    waterRefillIntervalPoints: 2500,
    disableFuelRefuel: true,
    fuelTargetEnd: 2600,
  },
]
