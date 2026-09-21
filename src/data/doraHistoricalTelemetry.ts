import type { Dora, DoraResourceKey, TelemetryPoint } from '@/types'
import { dummyDoras } from './doraDemoData'
import {
  DORA_HISTORY_DAYS,
  DORA_HISTORY_POINTS_PER_DAY,
  DORA_RESOURCE_RANGES,
} from './doraConstants'
import { getDoraHistoricalTimestamps, type DoraTelemetrySeries } from './doraTimestamps'
import { clamp, createSeededRandom, hashSeed, round } from './seededRandom'
import { getColomboHour, getCurrentDate, getSevenDayRange } from '@/utils/dates'

interface PatrolWindow {
  startHour: number
  endHour: number
}

interface DoraHistoryProfile {
  id: string
  fuelStart: number
  fuelBurnOperating: number
  fuelBurnIdle: number
  fuelRefuelAmount: number
  fuelRefuelCount: number
  patrolWindows: PatrolWindow[]
  heavyDayModulo: number
  powerIdle: number
  powerCruise: number
  powerPeak: number
  peakHour: number
}

const HISTORY_PROFILES: DoraHistoryProfile[] = [
  {
    id: 'dora-01',
    fuelStart: 1880,
    fuelBurnOperating: 2.4,
    fuelBurnIdle: 0.18,
    fuelRefuelAmount: 720,
    fuelRefuelCount: 3,
    patrolWindows: [{ startHour: 6, endHour: 14 }],
    heavyDayModulo: 3,
    powerIdle: 7,
    powerCruise: 18,
    powerPeak: 31,
    peakHour: 10,
  },
  {
    id: 'dora-02',
    fuelStart: 1760,
    fuelBurnOperating: 3.1,
    fuelBurnIdle: 0.22,
    fuelRefuelAmount: 640,
    fuelRefuelCount: 2,
    patrolWindows: [{ startHour: 8, endHour: 18 }],
    heavyDayModulo: 2,
    powerIdle: 8,
    powerCruise: 21,
    powerPeak: 34,
    peakHour: 13,
  },
  {
    id: 'dora-03',
    fuelStart: 1650,
    fuelBurnOperating: 3.6,
    fuelBurnIdle: 0.25,
    fuelRefuelAmount: 480,
    fuelRefuelCount: 1,
    patrolWindows: [
      { startHour: 5, endHour: 12 },
      { startHour: 16, endHour: 21 },
    ],
    heavyDayModulo: 2,
    powerIdle: 6,
    powerCruise: 17,
    powerPeak: 29,
    peakHour: 8,
  },
  {
    id: 'dora-04',
    fuelStart: 1820,
    fuelBurnOperating: 2.8,
    fuelBurnIdle: 0.2,
    fuelRefuelAmount: 860,
    fuelRefuelCount: 2,
    patrolWindows: [{ startHour: 10, endHour: 22 }],
    heavyDayModulo: 4,
    powerIdle: 9,
    powerCruise: 24,
    powerPeak: 37,
    peakHour: 16,
  },
  {
    id: 'dora-05',
    fuelStart: 1940,
    fuelBurnOperating: 2.15,
    fuelBurnIdle: 0.28,
    fuelRefuelAmount: 0,
    fuelRefuelCount: 0,
    patrolWindows: [{ startHour: 0, endHour: 9 }],
    heavyDayModulo: 1,
    powerIdle: 5,
    powerCruise: 14,
    powerPeak: 26,
    peakHour: 4,
  },
  {
    id: 'dora-06',
    fuelStart: 1900,
    fuelBurnOperating: 2.2,
    fuelBurnIdle: 0.16,
    fuelRefuelAmount: 900,
    fuelRefuelCount: 3,
    patrolWindows: [{ startHour: 12, endHour: 21 }],
    heavyDayModulo: 3,
    powerIdle: 10,
    powerCruise: 26,
    powerPeak: 39,
    peakHour: 17,
  },
]

function createNoiseWalk(
  rng: () => number,
  sigma: number,
  damping = 0.86,
): () => number {
  let state = 0
  return () => {
    state = state * damping + (rng() - 0.5) * sigma
    return state
  }
}

function smoothstep(t: number): number {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

function dayIndex(pointIndex: number): number {
  return Math.floor(pointIndex / DORA_HISTORY_POINTS_PER_DAY)
}

function isOperating(hour: number, windows: PatrolWindow[]): boolean {
  return windows.some(
    (window) => hour >= window.startHour && hour < window.endHour,
  )
}

function pinSeriesToCurrent(
  values: number[],
  current: number,
  min: number,
  max: number,
): void {
  if (values.length === 0) return
  const last = values.length - 1
  const delta = current - values[last]!
  for (let i = 0; i < values.length; i++) {
    values[i] = clamp(values[i]! + delta, min, max)
  }
  values[last] = current
}

function scheduleRefuels(
  profile: DoraHistoryProfile,
  totalPoints: number,
): { index: number; amount: number; duration: number }[] {
  if (profile.fuelRefuelCount <= 0 || profile.fuelRefuelAmount <= 0) return []

  const rng = createSeededRandom(hashSeed(profile.id, 'dora-fuel-refuels'))
  const events: { index: number; amount: number; duration: number }[] = []

  for (let i = 0; i < profile.fuelRefuelCount; i++) {
    const slot = (i + 1) / (profile.fuelRefuelCount + 1)
    const jitter = (rng() - 0.5) * 0.12
    const index = clamp(
      Math.floor(totalPoints * (slot + jitter)),
      36,
      totalPoints - 48,
    )
    events.push({
      index,
      amount: profile.fuelRefuelAmount * (0.82 + rng() * 0.36),
      duration: 3 + Math.floor(rng() * 4),
    })
  }

  return events.sort((a, b) => a.index - b.index)
}

function schedulePowerSurges(
  profile: DoraHistoryProfile,
  totalPoints: number,
): { start: number; duration: number; magnitude: number }[] {
  const rng = createSeededRandom(hashSeed(profile.id, 'dora-power-surges'))
  const count = 10 + Math.floor(rng() * 6)
  const events: { start: number; duration: number; magnitude: number }[] = []

  for (let i = 0; i < count; i++) {
    events.push({
      start: Math.floor(rng() * (totalPoints - 24)),
      duration: 8 + Math.floor(rng() * 18),
      magnitude: (rng() > 0.35 ? 1 : -1) * (6 + rng() * 10),
    })
  }

  return events
}

function surgeAt(
  index: number,
  events: { start: number; duration: number; magnitude: number }[],
): number {
  let boost = 0
  for (const event of events) {
    if (index >= event.start && index < event.start + event.duration) {
      const progress = (index - event.start) / Math.max(1, event.duration - 1)
      boost += event.magnitude * Math.sin(progress * Math.PI)
    }
  }
  return boost
}

function generateFuelValues(
  profile: DoraHistoryProfile,
  timestamps: string[],
  current: number,
): number[] {
  const { min, max } = DORA_RESOURCE_RANGES.fuelLevel
  const rng = createSeededRandom(hashSeed(profile.id, 'dora-fuel-history'))
  const noise = createNoiseWalk(rng, 8, 0.9)
  const refuels = scheduleRefuels(profile, timestamps.length)
  const values: number[] = []
  let fuel = profile.fuelStart

  for (let i = 0; i < timestamps.length; i++) {
    const hour = getColomboHour(timestamps[i]!)
    const day = dayIndex(i)
    const heavy = day % profile.heavyDayModulo === 0
    const operating = isOperating(hour, profile.patrolWindows)
    const rate = operating
      ? profile.fuelBurnOperating * (heavy ? 1.55 : 1)
      : profile.fuelBurnIdle
    fuel -= rate * (0.75 + rng() * 0.55) + noise() * 0.15

    const refuel = refuels.find(
      (event) => i >= event.index && i < event.index + event.duration,
    )
    if (refuel) {
      fuel += refuel.amount / refuel.duration
    }

    values.push(clamp(fuel, min + 40, max))
  }

  pinSeriesToCurrent(values, current, min, max)
  return values
}

function generatePowerValues(
  profile: DoraHistoryProfile,
  timestamps: string[],
  current: number,
): number[] {
  const { min, max } = DORA_RESOURCE_RANGES.powerConsumption
  const rng = createSeededRandom(hashSeed(profile.id, 'dora-power-history'))
  const noise = createNoiseWalk(rng, 3.4, 0.8)
  const surges = schedulePowerSurges(profile, timestamps.length)
  const values: number[] = []

  for (let i = 0; i < timestamps.length; i++) {
    const hour = getColomboHour(timestamps[i]!)
    const day = dayIndex(i)
    const dayRng = createSeededRandom(hashSeed(profile.id, 'dora-power-day', day))
    const peakHour = profile.peakHour + (dayRng() - 0.5) * 3
    const peakScale = 0.78 + dayRng() * 0.45
    const idle = profile.powerIdle * (0.8 + dayRng() * 0.4)
    const operating = isOperating(hour, profile.patrolWindows)

    let load = idle
    if (operating) {
      const peakBump = Math.exp(-((hour - peakHour) ** 2) / 6) * peakScale
      const cruiseMix = 0.45 + 0.55 * peakBump
      load =
        profile.powerCruise +
        (profile.powerPeak - profile.powerCruise) * cruiseMix
    } else {
      const nearest = profile.patrolWindows.reduce((closest, window) => {
        const dist = Math.min(
          Math.abs(hour - window.startHour),
          Math.abs(hour - window.endHour),
        )
        return Math.min(closest, dist)
      }, 24)
      if (nearest < 2) {
        const ramp = 1 - nearest / 2
        load = idle + (profile.powerCruise - idle) * smoothstep(ramp)
      }
    }

    load += surgeAt(i, surges)
    load += noise()
    values.push(clamp(load, min, max))
  }

  pinSeriesToCurrent(values, current, min, max)
  return values
}

function toPoints(
  timestamps: string[],
  values: number[],
  decimals: number,
): TelemetryPoint[] {
  return timestamps.map((timestamp, index) => ({
    timestamp,
    value: round(values[index]!, decimals),
  }))
}

function profileFor(doraId: string): DoraHistoryProfile {
  return HISTORY_PROFILES.find((profile) => profile.id === doraId) ?? {
    ...HISTORY_PROFILES[0]!,
    id: doraId,
  }
}

export interface DoraHistoricalRecord {
  doraId: string
  fuel: DoraTelemetrySeries
  power: DoraTelemetrySeries
}

function buildHistoryForDora(
  dora: Dora,
  timestamps: string[],
): DoraHistoricalRecord {
  const profile = profileFor(dora.id)
  const fuelValues = generateFuelValues(profile, timestamps, dora.fuelLevel)
  const powerValues = generatePowerValues(
    profile,
    timestamps,
    dora.powerConsumption,
  )

  return {
    doraId: dora.id,
    fuel: {
      doraId: dora.id,
      resource: 'fuelLevel',
      points: forceLatest(toPoints(timestamps, fuelValues, 0), dora.fuelLevel, 0),
    },
    power: {
      doraId: dora.id,
      resource: 'powerConsumption',
      points: forceLatest(
        toPoints(timestamps, powerValues, 1),
        dora.powerConsumption,
        1,
      ),
    },
  }
}

function forceLatest(
  points: TelemetryPoint[],
  current: number,
  decimals: number,
): TelemetryPoint[] {
  if (points.length === 0) return points
  const last = points[points.length - 1]!
  last.value = round(current, decimals)
  return points
}

let historyCache: Map<string, DoraHistoricalRecord> | null = null

function getHistoryCache(): Map<string, DoraHistoricalRecord> {
  if (!historyCache) {
    const timestamps = getDoraHistoricalTimestamps()
    historyCache = new Map(
      dummyDoras.map((dora) => [dora.id, buildHistoryForDora(dora, timestamps)]),
    )
  }
  return historyCache
}

export function getDoraHistoricalRecord(
  doraId: string,
): DoraHistoricalRecord | undefined {
  return getHistoryCache().get(doraId)
}

export function getDoraHistoricalSeries(
  doraId: string,
  resource: DoraResourceKey,
): DoraTelemetrySeries | undefined {
  const record = getDoraHistoricalRecord(doraId)
  if (!record) return undefined
  return resource === 'fuelLevel' ? record.fuel : record.power
}

export function getDoraHistoryLatestTimestamp(): string | null {
  const record = getHistoryCache().values().next().value as
    | DoraHistoricalRecord
    | undefined
  const last = record?.fuel.points[record.fuel.points.length - 1]
  return last?.timestamp ?? null
}

function prunePoints(
  points: TelemetryPoint[],
  cutoffMs: number,
): TelemetryPoint[] {
  if (points.length === 0) return points
  let dropCount = 0
  while (
    dropCount < points.length - 1 &&
    new Date(points[dropCount]!.timestamp).getTime() < cutoffMs
  ) {
    dropCount += 1
  }
  return dropCount > 0 ? points.slice(dropCount) : points
}

/** Append one live sample and drop points older than the rolling 7-day window. */
export function appendDoraLiveReadings(
  doraId: string,
  timestamp: string,
  fuelLevel: number,
  powerConsumption: number,
  now: Date = getCurrentDate(),
): void {
  const record = getHistoryCache().get(doraId)
  if (!record) return
  if (record.fuel.points.at(-1)?.timestamp === timestamp) return

  const cutoffMs = getSevenDayRange(now, DORA_HISTORY_DAYS).start.getTime()
  record.fuel = {
    ...record.fuel,
    points: prunePoints(
      [...record.fuel.points, { timestamp, value: round(fuelLevel, 0) }],
      cutoffMs,
    ),
  }
  record.power = {
    ...record.power,
    points: prunePoints(
      [
        ...record.power.points,
        { timestamp, value: round(powerConsumption, 1) },
      ],
      cutoffMs,
    ),
  }
}
