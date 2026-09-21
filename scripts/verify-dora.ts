import {
  DORA_HISTORY_DAYS,
  DORA_HISTORY_POINT_COUNT,
  DORA_RESOURCE_RANGES,
} from '../src/data/doraConstants.ts'
import { dummyDoras } from '../src/data/doraDemoData.ts'
import { getDoraHistoricalRecord } from '../src/data/doraHistoricalTelemetry.ts'
import {
  advanceDoraLiveIfDue,
  getLiveDoras,
  resetDoraLiveSimulator,
} from '../src/data/doraLiveSimulator.ts'
import { deriveDoraStatus } from '../src/data/doraStatusDerivation.ts'
import { deriveAlarmsFromDoras } from '../src/data/doraAlarmDerivation.ts'
import { evaluateDora } from '../src/monitoring/doraEvaluation.ts'

const failures: string[] = []

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message)
}

console.log('=== DORA verification ===\n')

check(dummyDoras.length === 6, `Expected 6 seed DORAs, got ${dummyDoras.length}`)
check(
  new Set(dummyDoras.map((dora) => dora.name)).size === 6,
  'DORA names must be unique',
)

for (const dora of dummyDoras) {
  const { min: fuelMin, max: fuelMax } = DORA_RESOURCE_RANGES.fuelLevel
  const { min: powerMin, max: powerMax } = DORA_RESOURCE_RANGES.powerConsumption
  check(
    dora.fuelLevel >= fuelMin && dora.fuelLevel <= fuelMax,
    `${dora.name} fuel ${dora.fuelLevel} outside ${fuelMin}–${fuelMax}`,
  )
  check(
    dora.powerConsumption >= powerMin && dora.powerConsumption <= powerMax,
    `${dora.name} power ${dora.powerConsumption} outside ${powerMin}–${powerMax}`,
  )
  check(
    Number.isFinite(dora.location.latitude) &&
      Number.isFinite(dora.location.longitude),
    `${dora.name} missing GPS`,
  )
  check(
    dora.status === deriveDoraStatus(dora),
    `${dora.name} stored status ${dora.status} != derived ${deriveDoraStatus(dora)}`,
  )

  const history = getDoraHistoricalRecord(dora.id)
  check(Boolean(history), `${dora.name} missing history`)
  if (!history) continue

  const fuelPoints = history.fuel.points
  const powerPoints = history.power.points
  check(
    fuelPoints.length === DORA_HISTORY_POINT_COUNT,
    `${dora.name} fuel history ${fuelPoints.length} != ${DORA_HISTORY_POINT_COUNT}`,
  )
  check(
    powerPoints.length === DORA_HISTORY_POINT_COUNT,
    `${dora.name} power history ${powerPoints.length} != ${DORA_HISTORY_POINT_COUNT}`,
  )

  const firstMs = new Date(fuelPoints[0]!.timestamp).getTime()
  const lastMs = new Date(fuelPoints[fuelPoints.length - 1]!.timestamp).getTime()
  const spanDays = (lastMs - firstMs) / (24 * 60 * 60 * 1000)
  check(
    spanDays >= DORA_HISTORY_DAYS - 0.15 && spanDays <= DORA_HISTORY_DAYS + 0.15,
    `${dora.name} history span ${spanDays.toFixed(2)}d, expected ~${DORA_HISTORY_DAYS}`,
  )
  check(
    fuelPoints[fuelPoints.length - 1]!.value === dora.fuelLevel,
    `${dora.name} fuel history end ${fuelPoints.at(-1)?.value} != current ${dora.fuelLevel}`,
  )
  check(
    powerPoints[powerPoints.length - 1]!.value === dora.powerConsumption,
    `${dora.name} power history end ${powerPoints.at(-1)?.value} != current ${dora.powerConsumption}`,
  )

  const fuelValues = fuelPoints.map((point) => point.value)
  const powerValues = powerPoints.map((point) => point.value)
  const fuelRange = Math.max(...fuelValues) - Math.min(...fuelValues)
  const powerRange = Math.max(...powerValues) - Math.min(...powerValues)
  check(fuelRange > 80, `${dora.name} fuel variance too small (${fuelRange.toFixed(0)} L)`)
  check(powerRange > 4, `${dora.name} power variance too small (${powerRange.toFixed(1)} kVA)`)

  const iso = fuelPoints[0]!.timestamp
  check(!iso.includes('2026-09-01T00:00:00'), 'Unexpected hardcoded date stamp')
}

const evaluations = dummyDoras.map(evaluateDora)
const normalCount = evaluations.filter((item) => item.status === 'normal').length
const warningCount = evaluations.filter((item) => item.status === 'warning').length
const criticalCount = evaluations.filter((item) => item.status === 'critical').length
check(normalCount + warningCount + criticalCount === 6, 'Status counts must total 6')

const alarms = deriveAlarmsFromDoras(dummyDoras)
const alarmIds = alarms.map((alarm) => alarm.id)
check(
  new Set(alarmIds).size === alarmIds.length,
  'Duplicate DORA alarm ids in derivation',
)
for (const alarm of alarms) {
  check(alarm.source === 'dora', `${alarm.id} missing DORA source`)
  check(alarm.severity === 'warning' || alarm.severity === 'critical', `${alarm.id} bad severity`)
}

const beforeHistory = getDoraHistoricalRecord('dora-01')!.fuel.points.length
const beforeLive = getLiveDoras()[0]!.fuelLevel
advanceDoraLiveIfDue(new Date(Date.now() + 60_000))
const afterLive = getLiveDoras()
check(afterLive.length === 6, 'Live store lost DORAs')
for (const dora of afterLive) {
  check(
    dora.fuelLevel >= 0 && dora.fuelLevel <= 2000,
    `Live ${dora.name} fuel out of range`,
  )
  check(
    dora.powerConsumption >= 0 && dora.powerConsumption <= 40,
    `Live ${dora.name} power out of range`,
  )
}
const afterHistory = getDoraHistoricalRecord('dora-01')!.fuel.points.length
check(
  afterHistory >= beforeHistory,
  'History was not appended (or was regenerated shorter)',
)

console.log(`Seed DORAs: ${dummyDoras.length}`)
console.log(`Status mix: ${normalCount} normal, ${warningCount} warning, ${criticalCount} critical`)
console.log(`Derived DORA alarms: ${alarms.length}`)
console.log(`Live fuel sample: ${beforeLive} → ${afterLive[0]!.fuelLevel}`)
console.log(`History points (dora-01 fuel): ${beforeHistory} → ${afterHistory}`)

resetDoraLiveSimulator()

if (failures.length > 0) {
  console.error('\nFAILED:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('\nDORA verification passed.')
