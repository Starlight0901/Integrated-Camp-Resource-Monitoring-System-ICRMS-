import { dummyAlarms, dummyCamps, dummyTelemetry } from './generateDataset'
import { evaluateMetricAlarm } from './alarmThresholds'
import { CAMP_PROFILES, TELEMETRY_POINT_COUNT } from './constants'
import type { MetricKey } from '@/types'

const METRIC_KEYS: MetricKey[] = [
  'apparentPower',
  'temperature',
  'waterLevel',
  'fuelLevel',
]

const EXPECTED: Record<string, 'online' | 'warning' | 'critical'> = {
  'camp-colombo': 'online',
  'camp-trincomalee': 'warning',
  'camp-jaffna': 'online',
  'camp-galle': 'critical',
}

let failed = false

function fail(message: string) {
  console.error(`✗ ${message}`)
  failed = true
}

function pass(message: string) {
  console.log(`✓ ${message}`)
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function consecutiveDiffStdDev(values: number[]): number {
  const diffs: number[] = []
  for (let i = 1; i < values.length; i++) {
    diffs.push(values[i]! - values[i - 1]!)
  }
  return stdDev(diffs)
}

console.log('=== Camp status ===\n')

for (const camp of dummyCamps) {
  const expected = EXPECTED[camp.id]
  const ok = camp.status === expected
  if (!ok) failed = true

  console.log(
    `${ok ? '✓' : '✗'} ${camp.name}: ${camp.status} (expected ${expected})`,
  )

  for (const [key, metric] of Object.entries(camp.metrics)) {
    const evalResult = evaluateMetricAlarm(
      key as keyof typeof camp.metrics,
      metric.value,
    )
    console.log(
      `    ${key}: ${metric.value} ${metric.unit}${evalResult ? ` → ${evalResult.severity}` : ''}`,
    )
  }
}

const counts = dummyCamps.reduce(
  (acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1
    return acc
  },
  {} as Record<string, number>,
)

console.log('\nFleet:', counts)
console.log('Alarms:', dummyAlarms.length)
for (const alarm of dummyAlarms) {
  console.log(`  ${alarm.campName} — ${alarm.metricLabel} (${alarm.severity})`)
}

console.log('\n=== Data integrity ===\n')

for (const series of dummyTelemetry) {
  if (series.points.length !== TELEMETRY_POINT_COUNT) {
    fail(
      `${series.campId}/${series.metric}: expected ${TELEMETRY_POINT_COUNT} points, got ${series.points.length}`,
    )
  }
}

pass(`All series contain ${TELEMETRY_POINT_COUNT} points (5-minute / 7-day)`)

for (const camp of dummyCamps) {
  for (const metricKey of METRIC_KEYS) {
    const series = dummyTelemetry.find(
      (entry) => entry.campId === camp.id && entry.metric === metricKey,
    )
    const latest = series?.points.at(-1)?.value
    const current = camp.metrics[metricKey].value

    if (latest === undefined || latest !== current) {
      fail(
        `${camp.id}/${metricKey}: dashboard ${current} ≠ latest chart ${latest}`,
      )
    }
  }
}

pass('Dashboard values match latest historical point for every camp/metric')

console.log('\n=== Series variation (not flat lines) ===\n')

const MIN_STD: Record<MetricKey, number> = {
  apparentPower: 8,
  temperature: 0.15,
  waterLevel: 0.35,
  fuelLevel: 400,
}

for (const profile of CAMP_PROFILES) {
  for (const metricKey of METRIC_KEYS) {
    const series = dummyTelemetry.find(
      (entry) => entry.campId === profile.id && entry.metric === metricKey,
    )
    const values = series?.points.map((p) => p.value) ?? []
    const spread = stdDev(values)
    const stepVar = consecutiveDiffStdDev(values)

    if (spread < MIN_STD[metricKey]) {
      fail(
        `${profile.id}/${metricKey}: std dev ${spread.toFixed(2)} below minimum ${MIN_STD[metricKey]}`,
      )
    } else {
      pass(
        `${profile.id}/${metricKey}: spread σ=${spread.toFixed(2)}, step σ=${stepVar.toFixed(3)}`,
      )
    }
  }
}

console.log('\n=== Demo narrative checks ===\n')

const trincoTemp = dummyTelemetry.find(
  (s) => s.campId === 'camp-trincomalee' && s.metric === 'temperature',
)!
const galleFuel = dummyTelemetry.find(
  (s) => s.campId === 'camp-galle' && s.metric === 'fuelLevel',
)!

const trincoFirst = trincoTemp.points[0]!.value
const trincoLast = trincoTemp.points.at(-1)!.value
console.log(`Trincomalee temperature: ${trincoFirst}°C → ${trincoLast}°C`)

if (trincoLast <= 25.5) {
  fail(`Trincomalee final temperature ${trincoLast}°C should exceed warning threshold (25.5°C)`)
} else {
  pass('Trincomalee temperature ends in warning range')
}

const galleFirst = galleFuel.points[0]!.value
const galleLast = galleFuel.points.at(-1)!.value
console.log(`Galle fuel: ${galleFirst} L → ${galleLast} L`)

if (galleFirst < 15000) {
  fail(`Galle fuel should start healthy (≥15000 L), got ${galleFirst} L`)
} else {
  pass('Galle fuel starts in healthy range')
}

const fuelWarningThreshold = 20000 * 0.3
const crossedWarning = galleFuel.points.some((p) => p.value <= fuelWarningThreshold)
if (!crossedWarning) {
  fail('Galle fuel never crossed warning threshold during the 7-day window')
} else {
  pass('Galle fuel crosses warning zone before reaching critical')
}

if (galleLast >= 20000 * 0.15) {
  fail(`Galle final fuel ${galleLast} L should be below critical threshold`)
} else {
  pass('Galle fuel ends in critical range')
}

const colomboPower = dummyTelemetry.find(
  (s) => s.campId === 'camp-colombo' && s.metric === 'apparentPower',
)!.points.map((p) => p.value)
const jaffnaPower = dummyTelemetry.find(
  (s) => s.campId === 'camp-jaffna' && s.metric === 'apparentPower',
)!.points.map((p) => p.value)

let powerSampleDelta = 0
if (colomboPower.length === jaffnaPower.length) {
  let diffSum = 0
  for (let i = 0; i < colomboPower.length; i += 48) {
    diffSum += Math.abs(colomboPower[i]! - jaffnaPower[i]!)
  }
  powerSampleDelta = diffSum / (colomboPower.length / 48)
}

if (powerSampleDelta < 3) {
  fail('Colombo and Jaffna power curves are too similar')
} else {
  pass(`Colombo vs Jaffna power profiles differ (avg sample Δ=${powerSampleDelta.toFixed(1)} kVA)`)
}

console.log(`\nProfiles configured: ${CAMP_PROFILES.length} camps`)

if (failed) {
  console.error('\nDemo status verification FAILED')
  throw new Error('Demo status verification failed')
}

console.log('\nDemo status verification PASSED')
