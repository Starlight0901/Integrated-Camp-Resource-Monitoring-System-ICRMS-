import type { Dora } from '@/types'
import {
  DORA_LIVE_MAX_DELTA,
  DORA_LIVE_SIMULATOR_INTERVAL_MS,
  DORA_LIVE_TELEMETRY_SIMULATOR,
  DORA_RESOURCE_RANGES,
} from './doraConstants'
import { dummyDoras } from './doraDemoData'
import {
  appendDoraLiveReadings,
  getDoraHistoryLatestTimestamp,
} from './doraHistoricalTelemetry'
import { deriveDoraStatus } from './doraStatusDerivation'
import { clamp, createSeededRandom, hashSeed, round } from './seededRandom'
import { floorToMinute, getCurrentDate } from '@/utils/dates'

interface DoraLiveBehavior {
  fuelBias: number
  fuelVolatility: number
  fuelRefuelChance: number
  fuelRefuelAmount: [number, number]
  minMinutesBetweenRefuel: number
  powerTarget: number
  powerVolatility: number
  powerMaxDelta: number
}

interface DoraSimState {
  rng: () => number
  minutesSinceFuelRefuel: number
}

const MAX_CATCH_UP_TICKS = 120

const LIVE_BEHAVIOR: Record<string, DoraLiveBehavior> = {
  'dora-01': {
    fuelBias: -3.2,
    fuelVolatility: 0.22,
    fuelRefuelChance: 0.006,
    fuelRefuelAmount: [70, 130],
    minMinutesBetweenRefuel: 90,
    powerTarget: 14.5,
    powerVolatility: 0.22,
    powerMaxDelta: 0.6,
  },
  'dora-02': {
    fuelBias: -4.4,
    fuelVolatility: 0.35,
    fuelRefuelChance: 0.01,
    fuelRefuelAmount: [80, 150],
    minMinutesBetweenRefuel: 70,
    powerTarget: 22,
    powerVolatility: 0.45,
    powerMaxDelta: 1.1,
  },
  'dora-03': {
    fuelBias: -5.8,
    fuelVolatility: 0.28,
    fuelRefuelChance: 0.003,
    fuelRefuelAmount: [60, 110],
    minMinutesBetweenRefuel: 120,
    powerTarget: 19.5,
    powerVolatility: 0.32,
    powerMaxDelta: 0.8,
  },
  'dora-04': {
    fuelBias: -4.1,
    fuelVolatility: 0.4,
    fuelRefuelChance: 0.012,
    fuelRefuelAmount: [90, 160],
    minMinutesBetweenRefuel: 60,
    powerTarget: 33.2,
    powerVolatility: 0.62,
    powerMaxDelta: 1.6,
  },
  'dora-05': {
    fuelBias: -7.2,
    fuelVolatility: 0.18,
    fuelRefuelChance: 0,
    fuelRefuelAmount: [0, 0],
    minMinutesBetweenRefuel: 999,
    powerTarget: 11,
    powerVolatility: 0.2,
    powerMaxDelta: 0.5,
  },
  'dora-06': {
    fuelBias: -3.6,
    fuelVolatility: 0.3,
    fuelRefuelChance: 0.008,
    fuelRefuelAmount: [100, 180],
    minMinutesBetweenRefuel: 80,
    powerTarget: 38.4,
    powerVolatility: 0.5,
    powerMaxDelta: 1.4,
  },
}

const DEFAULT_BEHAVIOR: DoraLiveBehavior = LIVE_BEHAVIOR['dora-01']!

function behaviorFor(doraId: string): DoraLiveBehavior {
  return LIVE_BEHAVIOR[doraId] ?? DEFAULT_BEHAVIOR
}

function triangularUnit(rng: () => number): number {
  return rng() + rng() - 1
}

function reflectIntoRange(value: number, min: number, max: number): number {
  if (value < min) return min + (min - value)
  if (value > max) return max - (value - max)
  return value
}

const simStates = new Map<string, DoraSimState>()

function getSimState(doraId: string): DoraSimState {
  let state = simStates.get(doraId)
  if (!state) {
    state = {
      rng: createSeededRandom(hashSeed(doraId, 'dora-live-sim')),
      minutesSinceFuelRefuel: 40 + (doraId.charCodeAt(doraId.length - 1) % 25),
    }
    simStates.set(doraId, state)
  }
  return state
}

function stepFuel(
  previous: number,
  behavior: DoraLiveBehavior,
  state: DoraSimState,
): number {
  const { min, max } = DORA_RESOURCE_RANGES.fuelLevel
  const stepCap = DORA_LIVE_MAX_DELTA.fuelLevel
  const nearEmpty = previous < 80
  const nearFull = previous > max * 0.96

  const canRefuel =
    behavior.fuelRefuelChance > 0 &&
    state.minutesSinceFuelRefuel >= behavior.minMinutesBetweenRefuel &&
    previous < max * 0.7

  let delta: number
  if (canRefuel && (nearEmpty || state.rng() < behavior.fuelRefuelChance)) {
    const [lo, hi] = behavior.fuelRefuelAmount
    delta = lo + state.rng() * (hi - lo)
    state.minutesSinceFuelRefuel = 0
  } else {
    state.minutesSinceFuelRefuel += 1
    delta =
      behavior.fuelBias * (0.55 + state.rng() * 0.55) +
      triangularUnit(state.rng) * stepCap * behavior.fuelVolatility
    if (nearFull) delta = Math.min(delta, -1)
    if (nearEmpty && behavior.fuelRefuelChance === 0) {
      delta = Math.min(delta, -0.4)
    }
    delta = clamp(delta, -stepCap, stepCap)
  }

  const next = reflectIntoRange(previous + delta, min, max)
  return round(clamp(next, min, max), 0)
}

function stepPower(
  previous: number,
  behavior: DoraLiveBehavior,
  state: DoraSimState,
): number {
  const { min, max } = DORA_RESOURCE_RANGES.powerConsumption
  const cap = Math.min(behavior.powerMaxDelta, DORA_LIVE_MAX_DELTA.powerConsumption)

  let delta =
    triangularUnit(state.rng) * cap * behavior.powerVolatility +
    (behavior.powerTarget - previous) * 0.06
  if (state.rng() < 0.08) {
    delta = triangularUnit(state.rng) * cap
  }
  delta = clamp(delta, -cap, cap)

  const next = reflectIntoRange(previous + delta, min, max)
  return round(clamp(next, min, max), 1)
}

function cloneDoras(doras: Dora[]): Dora[] {
  return doras.map((dora) => ({
    ...dora,
    location: { ...dora.location },
  }))
}

let liveDoras: Dora[] = cloneDoras(dummyDoras)
const listeners = new Set<() => void>()
let subscriberCount = 0
let alignTimeout: ReturnType<typeof setTimeout> | undefined
let tickInterval: ReturnType<typeof setInterval> | undefined

function notify(): void {
  for (const listener of listeners) listener()
}

function applyLiveTick(atMs: number): void {
  const timestamp = new Date(atMs).toISOString()
  const now = new Date(atMs)

  liveDoras = liveDoras.map((dora) => {
    const behavior = behaviorFor(dora.id)
    const state = getSimState(dora.id)
    const fuelLevel = stepFuel(dora.fuelLevel, behavior, state)
    const powerConsumption = stepPower(dora.powerConsumption, behavior, state)
    const next: Dora = {
      ...dora,
      location: { ...dora.location },
      fuelLevel,
      powerConsumption,
      status: deriveDoraStatus({ fuelLevel, powerConsumption }),
    }
    appendDoraLiveReadings(
      next.id,
      timestamp,
      next.fuelLevel,
      next.powerConsumption,
      now,
    )
    return next
  })
}

export function advanceDoraLiveIfDue(now: Date = getCurrentDate()): number {
  if (!DORA_LIVE_TELEMETRY_SIMULATOR) return 0

  const lastTs = getDoraHistoryLatestTimestamp()
  if (!lastTs) return 0

  const nowMinuteMs = floorToMinute(now.getTime())
  let lastMs = new Date(lastTs).getTime()
  let applied = 0

  while (applied < MAX_CATCH_UP_TICKS) {
    const nextMs = lastMs + DORA_LIVE_SIMULATOR_INTERVAL_MS
    if (nextMs > nowMinuteMs) break
    applyLiveTick(nextMs)
    lastMs = nextMs
    applied += 1
  }

  if (applied > 0) notify()
  return applied
}

export function msUntilNextDoraLiveTick(now: Date = getCurrentDate()): number {
  const elapsed = now.getTime() % DORA_LIVE_SIMULATOR_INTERVAL_MS
  return elapsed === 0
    ? DORA_LIVE_SIMULATOR_INTERVAL_MS
    : DORA_LIVE_SIMULATOR_INTERVAL_MS - elapsed
}

function runTick(): void {
  advanceDoraLiveIfDue()
}

function startSimulator(): void {
  if (alignTimeout || tickInterval) return
  advanceDoraLiveIfDue()
  alignTimeout = setTimeout(() => {
    alignTimeout = undefined
    runTick()
    if (subscriberCount > 0 && !tickInterval) {
      tickInterval = setInterval(runTick, DORA_LIVE_SIMULATOR_INTERVAL_MS)
    }
  }, msUntilNextDoraLiveTick())
}

function stopSimulator(): void {
  if (alignTimeout) {
    clearTimeout(alignTimeout)
    alignTimeout = undefined
  }
  if (tickInterval) {
    clearInterval(tickInterval)
    tickInterval = undefined
  }
}

export function subscribeDoraLive(listener: () => void): () => void {
  listeners.add(listener)
  subscriberCount += 1
  if (subscriberCount === 1) startSimulator()

  return () => {
    listeners.delete(listener)
    subscriberCount = Math.max(0, subscriberCount - 1)
    if (subscriberCount === 0) stopSimulator()
  }
}

export function getLiveDoras(): Dora[] {
  return liveDoras
}

export function getLiveDora(doraId: string | undefined): Dora | null {
  if (!doraId) return null
  return liveDoras.find((dora) => dora.id === doraId) ?? null
}

export function isDoraLiveSimulatorActive(): boolean {
  return DORA_LIVE_TELEMETRY_SIMULATOR
}

export function resetDoraLiveSimulator(): void {
  stopSimulator()
  simStates.clear()
  liveDoras = cloneDoras(dummyDoras)
  subscriberCount = 0
  listeners.clear()
}
