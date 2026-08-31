import type { CampTelemetrySeries } from '@/types'
import {
  CAMP_PROFILES,
  LIVE_SIMULATOR_INTERVAL_MS,
  LIVE_SIMULATOR_MAX_DELTA,
  LIVE_TELEMETRY_SIMULATOR,
  METRIC_RANGES,
  TELEMETRY_DAYS,
  type CampProfile,
} from './constants'
import { clamp, createSeededRandom, hashSeed, round } from './seededRandom'
import { floorToMinute, getCurrentDate, getSevenDayRange } from '@/utils/dates'

type MetricRanges = typeof METRIC_RANGES
type LiveMetricKey = keyof typeof LIVE_SIMULATOR_MAX_DELTA

interface LiveCampBehavior {
  /** Typical fraction of max delta used for power noise (0–1). */
  powerVolatility: number
  /** Soft attractor for apparent power (kVA). */
  powerTarget: number
  tempVolatility: number
  /** Soft attractor for temperature (°C). */
  tempTarget: number
  /** Negative → consumption bias for water. */
  waterBias: number
  /** Chance of a refill-biased step each minute. */
  waterRefillChance: number
  /** Negative → consumption bias for fuel. */
  fuelBias: number
  /** Chance of a large refuel event (0 disables). */
  fuelRefuelChance: number
  /** Soft floor/ceiling to preserve demo critical/warning narratives. */
  fuelSoftMin?: number
  fuelSoftMax?: number
  tempSoftMin?: number
  tempSoftMax?: number
}

interface CampSimState {
  rng: () => number
  minutesSinceWaterRefill: number
  minutesSinceFuelRefuel: number
}

const METRIC_KEYS: LiveMetricKey[] = [
  'apparentPower',
  'temperature',
  'waterLevel',
  'fuelLevel',
]

const DECIMALS: Record<LiveMetricKey, number> = {
  apparentPower: 1,
  temperature: 1,
  waterLevel: 1,
  fuelLevel: 0,
}

/**
 * Camp-specific live behavior — extends profile narrative without
 * collapsing the designed Normal / Warning / Critical distribution.
 */
function liveBehaviorFor(profile: CampProfile): LiveCampBehavior {
  switch (profile.id) {
    case 'camp-trincomalee':
      return {
        powerVolatility: 0.55,
        powerTarget: profile.basePower,
        tempVolatility: 0.45,
        // Stay in warning band (25.5–26°C) without flipping to critical often
        tempTarget: 25.65,
        tempSoftMin: 25.52,
        tempSoftMax: 25.95,
        waterBias: -0.4,
        waterRefillChance: 0.05,
        fuelBias: -0.5,
        fuelRefuelChance: 0.01,
      }
    case 'camp-galle':
      return {
        powerVolatility: 0.4,
        powerTarget: profile.basePower,
        tempVolatility: 0.3,
        tempTarget: 24.9,
        waterBias: -0.45,
        waterRefillChance: 0.06,
        fuelBias: -0.65,
        fuelRefuelChance: 0,
        // Keep fuel critical (< 15% of 20,000 L = 3,000 L)
        fuelSoftMin: 2100,
        fuelSoftMax: 2950,
      }
    case 'camp-jaffna':
      return {
        powerVolatility: 0.32,
        powerTarget: profile.basePower,
        tempVolatility: 0.22,
        tempTarget: 24.85,
        waterBias: -0.35,
        waterRefillChance: 0.035,
        fuelBias: -0.5,
        fuelRefuelChance: 0.008,
      }
    default:
      // Colombo — stable
      return {
        powerVolatility: 0.35,
        powerTarget: profile.basePower,
        tempVolatility: 0.25,
        tempTarget: 24.8,
        waterBias: -0.4,
        waterRefillChance: 0.04,
        fuelBias: -0.55,
        fuelRefuelChance: profile.disableFuelRefuel ? 0 : 0.008,
      }
  }
}

/** Triangular noise in [-1, 1] — prefers small moves over extremes. */
function triangularUnit(rng: () => number): number {
  return rng() + rng() - 1
}

function reflectIntoRange(value: number, min: number, max: number): number {
  if (value < min) return min + (min - value)
  if (value > max) return max - (value - max)
  return value
}

function applySoftBand(
  value: number,
  softMin: number | undefined,
  softMax: number | undefined,
  hardMin: number,
  hardMax: number,
): number {
  let next = value
  if (softMin != null && next < softMin) {
    next = softMin + (softMin - next) * 0.5
  }
  if (softMax != null && next > softMax) {
    next = softMax - (next - softMax) * 0.5
  }
  return clamp(next, hardMin, hardMax)
}

function stepApparentPower(
  previous: number,
  behavior: LiveCampBehavior,
  rng: () => number,
): number {
  const max = LIVE_SIMULATOR_MAX_DELTA.apparentPower
  const { min: lo, max: hi } = METRIC_RANGES.apparentPower

  let delta = triangularUnit(rng) * max * behavior.powerVolatility
  if (rng() < 0.08) {
    delta = triangularUnit(rng) * max
  }
  delta += (behavior.powerTarget - previous) * 0.04
  delta = clamp(delta, -max, max)

  const next = reflectIntoRange(previous + delta, lo, hi)
  return round(clamp(next, lo, hi), DECIMALS.apparentPower)
}

function stepTemperature(
  previous: number,
  behavior: LiveCampBehavior,
  rng: () => number,
): number {
  const max = LIVE_SIMULATOR_MAX_DELTA.temperature
  const { min: lo, max: hi } = METRIC_RANGES.temperature

  let delta = triangularUnit(rng) * max * behavior.tempVolatility
  delta += (behavior.tempTarget - previous) * 0.18
  if (rng() < 0.06) {
    delta = triangularUnit(rng) * max
  }
  delta = clamp(delta, -max, max)

  let next = previous + delta
  next = applySoftBand(
    next,
    behavior.tempSoftMin,
    behavior.tempSoftMax,
    lo,
    hi,
  )
  next = reflectIntoRange(next, lo, hi)
  return round(clamp(next, lo, hi), DECIMALS.temperature)
}

function stepWater(
  previous: number,
  behavior: LiveCampBehavior,
  rng: () => number,
  state: CampSimState,
): number {
  const max = LIVE_SIMULATOR_MAX_DELTA.waterLevel
  const { min: lo, max: hi } = METRIC_RANGES.waterLevel

  const nearEmpty = (previous - lo) / (hi - lo) < 0.12
  const nearFull = (previous - lo) / (hi - lo) > 0.92

  let delta: number
  const refillDue =
    state.minutesSinceWaterRefill > 25 &&
    (nearEmpty || rng() < behavior.waterRefillChance)

  if (refillDue) {
    delta = 0.8 + rng() * max
    state.minutesSinceWaterRefill = 0
  } else {
    state.minutesSinceWaterRefill += 1
    // Consumption-biased walk; most steps smaller than the max
    delta =
      behavior.waterBias * max * (0.25 + rng() * 0.55) +
      triangularUnit(rng) * max * 0.25
    if (nearFull) delta = Math.min(delta, -0.2)
    if (nearEmpty) delta = Math.max(delta, 0.3)
  }

  delta = clamp(delta, -max, max)
  const next = reflectIntoRange(previous + delta, lo, hi)
  return round(clamp(next, lo, hi), DECIMALS.waterLevel)
}

function stepFuel(
  previous: number,
  behavior: LiveCampBehavior,
  profile: CampProfile,
  rng: () => number,
  state: CampSimState,
): number {
  const max = LIVE_SIMULATOR_MAX_DELTA.fuelLevel
  const { min: lo, max: hi } = METRIC_RANGES.fuelLevel

  const nearEmpty = previous < hi * 0.12
  const nearFull = previous > hi * 0.95
  const refuelAllowed =
    !profile.disableFuelRefuel &&
    behavior.fuelRefuelChance > 0 &&
    state.minutesSinceFuelRefuel > 45

  let delta: number
  let isRefuelEvent = false

  if (refuelAllowed && (nearEmpty || rng() < behavior.fuelRefuelChance)) {
    // Occasional refuel — may exceed the normal per-minute delta
    delta = 1800 + rng() * 3200
    state.minutesSinceFuelRefuel = 0
    isRefuelEvent = true
  } else {
    state.minutesSinceFuelRefuel += 1
    const consume = Math.abs(behavior.fuelBias) * max * (0.35 + rng() * 0.5)
    delta = -consume + triangularUnit(rng) * max * 0.2
    if (nearFull) delta = Math.min(delta, -15)
    if (
      behavior.fuelSoftMin != null &&
      previous <= behavior.fuelSoftMin + 80
    ) {
      delta = Math.abs(delta) * 0.4
    }
  }

  if (!isRefuelEvent) {
    delta = clamp(delta, -max, max)
  }

  let next = previous + delta
  next = applySoftBand(
    next,
    behavior.fuelSoftMin,
    behavior.fuelSoftMax,
    lo,
    hi,
  )
  next = reflectIntoRange(next, lo, hi)
  return round(clamp(next, lo, hi), DECIMALS.fuelLevel)
}

function nextMetricValue(
  metric: LiveMetricKey,
  previous: number,
  profile: CampProfile,
  behavior: LiveCampBehavior,
  state: CampSimState,
): number {
  switch (metric) {
    case 'apparentPower':
      return stepApparentPower(previous, behavior, state.rng)
    case 'temperature':
      return stepTemperature(previous, behavior, state.rng)
    case 'waterLevel':
      return stepWater(previous, behavior, state.rng, state)
    case 'fuelLevel':
      return stepFuel(previous, behavior, profile, state.rng, state)
  }
}

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

const campStates = new Map<string, CampSimState>()

function getCampState(profile: CampProfile): CampSimState {
  let state = campStates.get(profile.id)
  if (!state) {
    state = {
      rng: createSeededRandom(hashSeed(profile.id, 'live-sim', profile.seed)),
      minutesSinceWaterRefill: 20 + (profile.seed % 15),
      minutesSinceFuelRefuel: 30 + (profile.seed % 20),
    }
    campStates.set(profile.id, state)
  }
  return state
}

function lastPointValue(series: CampTelemetrySeries): number {
  const last = series.points[series.points.length - 1]
  return last?.value ?? 0
}

const MAX_CATCH_UP_TICKS = 120

/**
 * Drop samples older than the rolling 7-day window relative to `now`.
 * Keeps the shared timestamp axis and every series in lockstep.
 */
export function pruneTelemetryWindow(
  telemetry: CampTelemetrySeries[],
  timestamps: string[],
  now: Date = getCurrentDate(),
): number {
  if (timestamps.length === 0) return 0

  const cutoffMs = getSevenDayRange(now, TELEMETRY_DAYS).start.getTime()
  let dropCount = 0
  while (
    dropCount < timestamps.length &&
    new Date(timestamps[dropCount]!).getTime() < cutoffMs
  ) {
    dropCount += 1
  }

  if (dropCount === 0) return 0

  timestamps.splice(0, dropCount)
  for (const series of telemetry) {
    if (series.points.length === 0) continue
    let seriesDrop = 0
    while (
      seriesDrop < series.points.length &&
      new Date(series.points[seriesDrop]!.timestamp).getTime() < cutoffMs
    ) {
      seriesDrop += 1
    }
    if (seriesDrop > 0) series.points.splice(0, seriesDrop)
  }

  return dropCount
}

/**
 * Append one simulated minute for every camp × metric.
 * Mutates `telemetry` series and shared `timestamps` in place.
 *
 * Pass `atMs` to stamp a specific instant (used by wall-clock catch-up).
 * Direct callers without `atMs` step one minute past the last sample
 * (test harnesses that simulate many ticks in a tight loop).
 */
export function appendLiveTelemetryTick(
  telemetry: CampTelemetrySeries[],
  timestamps: string[],
  atMs?: number,
): string {
  const lastTs = timestamps[timestamps.length - 1] ?? getCurrentDate().toISOString()
  const lastMs = new Date(lastTs).getTime()
  const nextMs = atMs ?? lastMs + LIVE_SIMULATOR_INTERVAL_MS
  const nextTs = new Date(nextMs).toISOString()

  timestamps.push(nextTs)

  for (const profile of CAMP_PROFILES) {
    const behavior = liveBehaviorFor(profile)
    const state = getCampState(profile)

    for (const metric of METRIC_KEYS) {
      const series = telemetry.find(
        (entry) => entry.campId === profile.id && entry.metric === metric,
      )
      if (!series || series.points.length === 0) continue

      const previous = lastPointValue(series)
      const value = nextMetricValue(metric, previous, profile, behavior, state)
      series.points.push({ timestamp: nextTs, value })
    }
  }

  pruneTelemetryWindow(telemetry, timestamps, new Date(nextMs))
  return nextTs
}

/**
 * Catch up missed simulator minutes up to the current wall-clock minute.
 * Never emits a timestamp in the future. Idempotent within the same minute.
 */
export function advanceLiveTelemetryIfDue(
  telemetry: CampTelemetrySeries[],
  timestamps: string[],
  now: Date = getCurrentDate(),
): number {
  if (!LIVE_TELEMETRY_SIMULATOR) return 0
  if (timestamps.length === 0) return 0

  const nowMinuteMs = floorToMinute(now.getTime())
  let applied = 0

  while (applied < MAX_CATCH_UP_TICKS) {
    const lastMs = new Date(timestamps[timestamps.length - 1]!).getTime()
    const nextMs = lastMs + LIVE_SIMULATOR_INTERVAL_MS
    if (nextMs > nowMinuteMs) break
    appendLiveTelemetryTick(telemetry, timestamps, nextMs)
    applied += 1
  }

  pruneTelemetryWindow(telemetry, timestamps, now)
  return applied
}

/** Align UI refresh to the next wall-clock minute. */
export function msUntilNextLiveSimulatorTick(
  now: Date = getCurrentDate(),
): number {
  if (!LIVE_TELEMETRY_SIMULATOR) {
    return LIVE_SIMULATOR_INTERVAL_MS
  }

  const elapsed = now.getTime() % LIVE_SIMULATOR_INTERVAL_MS
  return elapsed === 0
    ? LIVE_SIMULATOR_INTERVAL_MS
    : LIVE_SIMULATOR_INTERVAL_MS - elapsed
}

export function isLiveTelemetrySimulatorActive(): boolean {
  return LIVE_TELEMETRY_SIMULATOR
}

/** Test helper — resets per-camp RNG / refill state (does not wipe series). */
export function resetLiveSimulatorClock(): void {
  campStates.clear()
}

export type { LiveCampBehavior, MetricRanges }
