import { dummyAlarms, dummyCamps, dummyTelemetry, TELEMETRY_POINT_COUNT } from '../src/data/index.ts'

console.log('=== SLNAFMS Dummy Telemetry Verification ===')
console.log(`Expected points per series: ${TELEMETRY_POINT_COUNT}\n`)

for (const camp of dummyCamps) {
  console.log(`${camp.name} [${camp.status}]`)
  for (const metric of Object.values(camp.metrics)) {
    const series = dummyTelemetry.find(
      (s) => s.campId === camp.id && s.metric === metric.key,
    )!
    const latest = series.points.at(-1)!
    const match = latest.value === metric.value ? 'OK' : 'MISMATCH'
    console.log(
      `  ${metric.label}: ${metric.value} ${metric.unit} (${series.points.length} pts) ${match}`,
    )
  }
  console.log('')
}

const active = dummyAlarms.filter((a) => !a.acknowledged)
console.log(`Alarms: ${dummyAlarms.length} total, ${active.length} active`)
for (const alarm of active) {
  console.log(`  [${alarm.severity}] ${alarm.campId}: ${alarm.message}`)
}
