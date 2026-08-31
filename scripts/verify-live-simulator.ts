import {
  dummyTelemetry,
  telemetryTimestamps,
  getLiveTelemetrySnapshot,
} from '../src/data/generateDataset.ts'
import {
  appendLiveTelemetryTick,
  resetLiveSimulatorClock,
} from '../src/data/liveTelemetrySimulator.ts'
import {
  LIVE_SIMULATOR_MAX_DELTA,
  DEFAULT_ENERGY_CONSUMPTION,
} from '../src/data/constants.ts'

resetLiveSimulatorClock()

const initial = getLiveTelemetrySnapshot()
console.log(
  'Initial statuses:',
  initial.camps.map((c) => `${c.id}=${c.status}`).join(', '),
)
console.log('Energy sample:', JSON.stringify(initial.camps[0]!.energyConsumption))

const prev = new Map<string, number>()
for (const s of dummyTelemetry) {
  prev.set(`${s.campId}/${s.metric}`, s.points[s.points.length - 1]!.value)
}

let violations = 0
const statusHist = { online: 0, warning: 0, critical: 0, offline: 0 }
const maxSeen: Record<string, number> = {
  apparentPower: 0,
  temperature: 0,
  waterLevel: 0,
  fuelLevel: 0,
}

for (let i = 0; i < 30; i++) {
  appendLiveTelemetryTick(dummyTelemetry, telemetryTimestamps)
  const snap = getLiveTelemetrySnapshot()
  for (const c of snap.camps) {
    statusHist[c.status] += 1
  }
  for (const s of dummyTelemetry) {
    const key = `${s.campId}/${s.metric}`
    const cur = s.points[s.points.length - 1]!.value
    const p = prev.get(key)!
    const delta = Math.abs(cur - p)
    const max = LIVE_SIMULATOR_MAX_DELTA[s.metric as keyof typeof LIVE_SIMULATOR_MAX_DELTA]
    if (s.metric === 'fuelLevel' && delta > max) {
      // refuel event
    } else if (delta > max + 1e-9) {
      console.log('VIOLATION', key, p, '->', cur, 'delta', delta)
      violations += 1
    }
    maxSeen[s.metric] = Math.max(maxSeen[s.metric]!, delta)
    prev.set(key, cur)
  }
}

console.log('Max deltas seen:', maxSeen)
console.log('Violations (excl refuel):', violations)
console.log('Status counts over 30 ticks:', statusHist)
console.log(
  'Final statuses:',
  getLiveTelemetrySnapshot()
    .camps.map((c) => `${c.id.replace('camp-', '')}=${c.status}`)
    .join(', '),
)
console.log(
  'Energy unchanged:',
  JSON.stringify(getLiveTelemetrySnapshot().camps[0]!.energyConsumption) ===
    JSON.stringify(DEFAULT_ENERGY_CONSUMPTION),
)
console.log(
  'Points after 30 ticks:',
  dummyTelemetry[0]!.points.length,
)
