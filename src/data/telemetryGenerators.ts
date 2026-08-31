import type { TelemetryPoint } from '@/types'
import type { CampProfile } from './constants'
import { METRIC_RANGES, TELEMETRY_POINTS_PER_DAY } from './constants'
import { clamp, createSeededRandom, hashSeed, round } from './seededRandom'
import { getColomboHour } from '@/utils/dates'

// ---------------------------------------------------------------------------
// Shared simulation primitives
// ---------------------------------------------------------------------------

/** Local solar hour for Sri Lanka (Asia/Colombo). */
function localHour(timestamp: string): number {
  return getColomboHour(timestamp)
}

function dayIndex(pointIndex: number): number {
  return Math.floor(pointIndex / TELEMETRY_POINTS_PER_DAY)
}

function dayRng(profileId: string, metric: string, day: number): () => number {
  return createSeededRandom(hashSeed(profileId, metric, 'day', day))
}

/** Exponential smoothing — produces correlated sensor noise, not per-point spikes. */
function createNoiseWalk(
  rng: () => number,
  sigma: number,
  damping = 0.88,
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

function campVolatility(profile: CampProfile): number {
  switch (profile.id) {
    case 'camp-trincomalee':
      return 1.35
    case 'camp-jaffna':
      return 0.95
    case 'camp-galle':
      return 1.1
    default:
      return 1
  }
}

// ---------------------------------------------------------------------------
// Apparent Power — electrical load with daily variation & demand events
// ---------------------------------------------------------------------------

interface PowerDayProfile {
  loadFactor: number
  peakHour: number
  eveningBoost: number
  nightFloor: number
  volatility: number
}

function buildPowerDayProfile(
  profile: CampProfile,
  day: number,
): PowerDayProfile {
  const rng = dayRng(profile.id, 'power-day', day)
  const volatility = campVolatility(profile)

  return {
    loadFactor: 0.86 + rng() * 0.18,
    peakHour: 13 + rng() * 3,
    eveningBoost: rng() > 0.55 ? 0.06 + rng() * 0.1 : 0,
    nightFloor: 0.58 + rng() * 0.1,
    volatility,
  }
}

function powerDiurnalMultiplier(
  hour: number,
  dayProfile: PowerDayProfile,
): number {
  const { peakHour, eveningBoost, nightFloor } = dayProfile

  if (hour < 5) {
    return nightFloor + 0.03 * Math.sin(hour * 0.7)
  }
  if (hour < 8) {
    const ramp = smoothstep((hour - 5) / 3)
    return nightFloor + ramp * (0.78 - nightFloor)
  }
  if (hour < 17) {
    const plateau =
      0.78 +
      0.14 * Math.sin(((hour - 8) / 9) * Math.PI) +
      0.04 * Math.sin(hour * 1.3)
    const peakBump =
      Math.exp(-((hour - peakHour) ** 2) / 8) * 0.08
    return plateau + peakBump
  }
  if (hour < 21) {
    const evening = 0.86 + ((hour - 17) / 4) * (0.08 + eveningBoost)
    return evening
  }
  const windDown = 0.94 + eveningBoost - ((hour - 21) / 3) * 0.32
  return Math.max(nightFloor, windDown)
}

interface PowerEvent {
  startIndex: number
  duration: number
  magnitude: number
}

function schedulePowerEvents(
  profile: CampProfile,
  totalPoints: number,
): PowerEvent[] {
  const rng = createSeededRandom(hashSeed(profile.id, 'power-events'))
  const events: PowerEvent[] = []
  const volatility = campVolatility(profile)
  const eventCount = 4 + Math.floor(rng() * 4)

  for (let e = 0; e < eventCount; e++) {
    const startIndex = Math.floor(rng() * (totalPoints - 12))
    const duration = 2 + Math.floor(rng() * 5)
    const magnitude = (10 + rng() * 22) * volatility
    events.push({ startIndex, duration, magnitude })
  }

  return events
}

function powerEventBoost(
  index: number,
  events: PowerEvent[],
  rng: () => number,
): number {
  for (const event of events) {
    if (index >= event.startIndex && index < event.startIndex + event.duration) {
      const progress =
        (index - event.startIndex) / Math.max(1, event.duration - 1)
      const envelope = Math.sin(progress * Math.PI)
      return event.magnitude * envelope + (rng() - 0.5) * 2
    }
  }
  return 0
}

export function generateApparentPowerSeries(
  profile: CampProfile,
  timestamps: string[],
): TelemetryPoint[] {
  const rng = createSeededRandom(hashSeed(profile.id, 'apparentPower'))
  const noise = createNoiseWalk(rng, 3.2 * campVolatility(profile), 0.86)
  const microWalk = createNoiseWalk(rng, 1.4, 0.72)
  const { min, max } = METRIC_RANGES.apparentPower
  const events = schedulePowerEvents(profile, timestamps.length)
  const dayProfiles = Array.from({ length: 7 }, (_, day) =>
    buildPowerDayProfile(profile, day),
  )

  return timestamps.map((timestamp, index) => {
    const hour = localHour(timestamp)
    const day = dayIndex(index)
    const dayProfile = dayProfiles[day] ?? dayProfiles[0]!
    const diurnal = powerDiurnalMultiplier(hour, dayProfile)
    const slotNoise = (rng() - 0.5) * 1.8 * dayProfile.volatility

    const value = clamp(
      profile.basePower *
        dayProfile.loadFactor *
        diurnal +
        noise() +
        microWalk() +
        slotNoise +
        powerEventBoost(index, events, rng),
      min,
      max,
    )

    return { timestamp, value: round(value, 1) }
  })
}

// ---------------------------------------------------------------------------
// Temperature — asymmetric daily cycle with camp-specific drift
// ---------------------------------------------------------------------------

interface TempDayProfile {
  dailyMin: number
  dailyMax: number
  peakHour: number
  noiseScale: number
}

function buildTempDayProfiles(profile: CampProfile): TempDayProfile[] {
  const profiles: TempDayProfile[] = []

  const peakTargets =
    profile.id === 'camp-trincomalee'
      ? [25.2, 25.5, 25.3, 25.7, 25.4, 25.9, 26.0]
      : profile.id === 'camp-jaffna'
        ? [25.3, 25.5, 25.2, 25.6, 25.4, 25.5, 25.3]
        : profile.id === 'camp-galle'
          ? [25.1, 25.3, 25.2, 25.4, 25.3, 25.4, 25.2]
          : [25.2, 25.4, 25.3, 25.5, 25.4, 25.5, 25.3]

  for (let day = 0; day < 7; day++) {
    const rngDay = dayRng(profile.id, 'temp-day', day)
    const targetMax = peakTargets[day] ?? 25.4
    const dailyMin = clamp(
      24.0 + rngDay() * 0.55 + profile.tempOffset * 0.3,
      METRIC_RANGES.temperature.min,
      targetMax - 0.6,
    )

    profiles.push({
      dailyMin,
      dailyMax: clamp(
        targetMax + profile.tempOffset * 0.15,
        dailyMin + 0.4,
        METRIC_RANGES.temperature.max,
      ),
      peakHour: 13.5 + rngDay() * 2.5,
      noiseScale: 0.1 + rngDay() * 0.12,
    })
  }

  return profiles
}

function temperatureAtHour(
  hour: number,
  dayProfile: TempDayProfile,
): number {
  const { dailyMin, dailyMax, peakHour } = dayProfile
  const amplitude = (dailyMax - dailyMin) / 2
  const center = dailyMin + amplitude
  const phase = ((hour - peakHour) / 24) * Math.PI * 2
  const diurnal = center + amplitude * Math.cos(phase)

  // Short warm/cool pockets — not every day identical.
  const micro =
    0.06 * Math.sin(hour * 2.1 + peakHour) +
    0.04 * Math.sin(hour * 0.85)

  return diurnal + micro
}

interface TempEvent {
  startIndex: number
  duration: number
  delta: number
}

function scheduleTempEvents(profile: CampProfile): TempEvent[] {
  if (profile.id !== 'camp-trincomalee') return []

  const rng = createSeededRandom(hashSeed(profile.id, 'temp-events'))
  return [
    {
      startIndex: TELEMETRY_POINTS_PER_DAY * 2 + 80,
      duration: 36,
      delta: 0.18,
    },
    {
      startIndex: TELEMETRY_POINTS_PER_DAY * 5 + 140,
      duration: 28,
      delta: 0.22,
    },
  ].filter(() => rng() > -1)
}

export function generateTemperatureSeries(
  profile: CampProfile,
  timestamps: string[],
): TelemetryPoint[] {
  const rng = createSeededRandom(hashSeed(profile.id, 'temperature'))
  const noise = createNoiseWalk(rng, 0.14, 0.84)
  const micro = createNoiseWalk(rng, 0.06, 0.7)
  const { min, max } = METRIC_RANGES.temperature
  const dayProfiles = buildTempDayProfiles(profile)
  const events = scheduleTempEvents(profile)

  return timestamps.map((timestamp, index) => {
    const hour = localHour(timestamp)
    const day = dayIndex(index)
    const dayProfile = dayProfiles[day] ?? dayProfiles[0]!
    let value = temperatureAtHour(hour, dayProfile)

    for (const event of events) {
      if (index >= event.startIndex && index < event.startIndex + event.duration) {
        const progress = (index - event.startIndex) / event.duration
        const envelope = Math.sin(progress * Math.PI)
        value += event.delta * envelope
      }
    }

    value += noise() * dayProfile.noiseScale + micro() + (rng() - 0.5) * 0.06

    return { timestamp, value: round(clamp(value, min, max), 1) }
  })
}

// ---------------------------------------------------------------------------
// Water Tank — consumption bursts, stable periods, refills
// ---------------------------------------------------------------------------

type WaterMode = 'normal' | 'burst' | 'stable' | 'refill'

interface WaterSegment {
  startIndex: number
  endIndex: number
  mode: WaterMode
  rateMultiplier?: number
  targetLevel?: number
}

function scheduleWaterSegments(
  profile: CampProfile,
  totalPoints: number,
): WaterSegment[] {
  const rng = createSeededRandom(hashSeed(profile.id, 'water-segments'))
  const segments: WaterSegment[] = []
  let cursor = 0

  const refillCount =
    profile.id === 'camp-jaffna' ? 2 : profile.id === 'camp-colombo' ? 2 : 3

  const refillIndices: number[] = []
  for (let r = 0; r < refillCount; r++) {
    const minGap = Math.floor(totalPoints / (refillCount + 1))
    const idx =
      minGap * (r + 1) +
      Math.floor((rng() - 0.5) * minGap * 0.35)
    refillIndices.push(clamp(idx, 48, totalPoints - 48))
  }
  refillIndices.sort((a, b) => a - b)

  for (const refillAt of refillIndices) {
    if (refillAt <= cursor) continue

    const burstAt = cursor + Math.floor((refillAt - cursor) * (0.35 + rng() * 0.35))
    const stableAt = burstAt + 24 + Math.floor(rng() * 48)

    segments.push({
      startIndex: cursor,
      endIndex: burstAt,
      mode: 'normal',
      rateMultiplier: 0.75 + rng() * 0.5,
    })

    if (stableAt < refillAt - 18) {
      segments.push({
        startIndex: burstAt,
        endIndex: stableAt,
        mode: 'burst',
        rateMultiplier: 1.6 + rng() * 1.2,
      })
      segments.push({
        startIndex: stableAt,
        endIndex: refillAt,
        mode: 'stable',
        rateMultiplier: 0.08 + rng() * 0.12,
      })
    } else {
      segments.push({
        startIndex: burstAt,
        endIndex: refillAt,
        mode: 'burst',
        rateMultiplier: 1.3 + rng() * 0.9,
      })
    }

    segments.push({
      startIndex: refillAt,
      endIndex: refillAt + 6 + Math.floor(rng() * 6),
      mode: 'refill',
      targetLevel: clamp(40 + rng() * 8, 38, 48),
    })

    cursor = refillAt + 8
  }

  if (cursor < totalPoints) {
    segments.push({
      startIndex: cursor,
      endIndex: totalPoints,
      mode: 'normal',
      rateMultiplier: 0.85 + rng() * 0.45,
    })
  }

  return segments
}

function waterSegmentAt(
  index: number,
  segments: WaterSegment[],
): WaterSegment {
  return (
    segments.find((s) => index >= s.startIndex && index < s.endIndex) ??
    segments[segments.length - 1]!
  )
}

export function generateWaterTankSeries(
  profile: CampProfile,
  timestamps: string[],
): TelemetryPoint[] {
  const rng = createSeededRandom(hashSeed(profile.id, 'waterLevel'))
  const noise = createNoiseWalk(rng, 0.025, 0.8)
  const { min, max } = METRIC_RANGES.waterLevel
  const segments = scheduleWaterSegments(profile, timestamps.length)
  let level = profile.waterStart
  const points: TelemetryPoint[] = []

  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i]!
    const hour = localHour(timestamp)
    const segment = waterSegmentAt(i, segments)
    const isDaytime = hour >= 6 && hour <= 22

    if (segment.mode === 'refill') {
      const target = segment.targetLevel ?? max * 0.85
      const stepsLeft = segment.endIndex - i
      const step = (target - level) / Math.max(1, stepsLeft)
      level += step + noise() * 0.01
    } else {
      const baseRate =
        profile.waterConsumption *
        (segment.rateMultiplier ?? 1) *
        (isDaytime ? 1.15 : 0.5)

      const jitter = 0.85 + rng() * 0.3
      level -= baseRate * jitter
      level += noise()
    }

    points.push({
      timestamp,
      value: round(clamp(level, min, max), 2),
    })
  }

  return points
}

// ---------------------------------------------------------------------------
// Fuel — declining consumption with refuel events
// ---------------------------------------------------------------------------

interface FuelSegment {
  startIndex: number
  endIndex: number
  rateMultiplier: number
}

interface FuelRefuelEvent {
  startIndex: number
  duration: number
  targetLevel: number
}

function scheduleFuelPlan(
  profile: CampProfile,
  totalPoints: number,
): { segments: FuelSegment[]; refuels: FuelRefuelEvent[] } {
  const rng = createSeededRandom(hashSeed(profile.id, 'fuel-plan'))
  const segments: FuelSegment[] = []
  const refuels: FuelRefuelEvent[] = []

  if (profile.disableFuelRefuel) {
    const phaseLengths = [
      Math.floor(totalPoints * 0.18),
      Math.floor(totalPoints * 0.22),
      Math.floor(totalPoints * 0.2),
      Math.floor(totalPoints * 0.18),
      totalPoints,
    ]
    const multipliers = [0.75, 1.05, 1.35, 1.15, 0.95]
    let cursor = 0
    for (let p = 0; p < phaseLengths.length; p++) {
      const end = Math.min(cursor + phaseLengths[p]!, totalPoints)
      segments.push({
        startIndex: cursor,
        endIndex: end,
        rateMultiplier: multipliers[p]!,
      })
      cursor = end
    }
    return { segments, refuels }
  }

  const refuelPoints = [
    Math.floor(totalPoints * (0.28 + rng() * 0.08)),
    Math.floor(totalPoints * (0.62 + rng() * 0.1)),
  ]

  let cursor = 0
  for (const refuelAt of refuelPoints) {
    const burstStart = cursor + Math.floor((refuelAt - cursor) * (0.4 + rng() * 0.3))
    segments.push({
      startIndex: cursor,
      endIndex: burstStart,
      rateMultiplier: 0.8 + rng() * 0.35,
    })
    segments.push({
      startIndex: burstStart,
      endIndex: refuelAt,
      rateMultiplier: 1.2 + rng() * 0.55,
    })
    refuels.push({
      startIndex: refuelAt,
      duration: 4 + Math.floor(rng() * 4),
      targetLevel: clamp(16500 + rng() * 2500, 15500, 19500),
    })
    cursor = refuelAt + 6
  }

  segments.push({
    startIndex: cursor,
    endIndex: totalPoints,
    rateMultiplier: 0.85 + rng() * 0.4,
  })

  return { segments, refuels }
}

function fuelSegmentAt(
  index: number,
  segments: FuelSegment[],
): FuelSegment {
  return (
    segments.find((s) => index >= s.startIndex && index < s.endIndex) ??
    segments[segments.length - 1]!
  )
}

function activeRefuel(
  index: number,
  refuels: FuelRefuelEvent[],
): FuelRefuelEvent | null {
  return (
    refuels.find(
      (r) => index >= r.startIndex && index < r.startIndex + r.duration,
    ) ?? null
  )
}

export function generateFuelSeries(
  profile: CampProfile,
  timestamps: string[],
): TelemetryPoint[] {
  const rng = createSeededRandom(hashSeed(profile.id, 'fuelLevel'))
  const noise = createNoiseWalk(rng, 18, 0.82)
  const { min, max } = METRIC_RANGES.fuelLevel
  const { segments, refuels } = scheduleFuelPlan(profile, timestamps.length)
  let fuel = profile.fuelStart
  const points: TelemetryPoint[] = []

  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i]!
    const hour = localHour(timestamp)
    const isDaytime = hour >= 7 && hour <= 20
    const refuel = activeRefuel(i, refuels)

    if (refuel) {
      const stepsLeft = refuel.startIndex + refuel.duration - i
      const step = (refuel.targetLevel - fuel) / Math.max(1, stepsLeft)
      fuel += step + noise() * 0.15
    } else {
      const segment = fuelSegmentAt(i, segments)
      const burnRate =
        profile.fuelConsumption *
        segment.rateMultiplier *
        (isDaytime ? 1.08 : 0.72) *
        (0.88 + rng() * 0.24)

      fuel -= burnRate
      fuel += noise()
    }

    points.push({
      timestamp,
      value: round(clamp(fuel, min, max), 0),
    })
  }

  if (profile.id === 'camp-galle') {
    return scaleFuelSeriesToTarget(points, profile.fuelTargetEnd ?? 2600)
  }

  return points
}

/** Galle: preserve consumption shape but land exactly on the critical demo endpoint. */
function scaleFuelSeriesToTarget(
  points: TelemetryPoint[],
  targetEnd: number,
): TelemetryPoint[] {
  const start = points[0]!.value
  const rawEnd = points[points.length - 1]!.value
  const rawDrop = start - rawEnd
  const desiredDrop = start - targetEnd

  if (rawDrop <= 0) return points

  const scale = desiredDrop / rawDrop

  return points.map((point, index) => {
    if (index === 0) return point
    const delta = points[0]!.value - point.value
    const scaled = points[0]!.value - delta * scale
    return {
      ...point,
      value: round(clamp(scaled, METRIC_RANGES.fuelLevel.min, METRIC_RANGES.fuelLevel.max), 0),
    }
  })
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function latestTelemetryValue(points: TelemetryPoint[]): number {
  return points[points.length - 1]!.value
}

export function telemetryValueAt(
  points: TelemetryPoint[],
  index: number,
): number {
  const clamped = Math.max(0, Math.min(index, points.length - 1))
  return points[clamped]!.value
}
