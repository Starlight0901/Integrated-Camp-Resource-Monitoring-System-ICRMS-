/**
 * Boundary checks for rolling telemetry dates (Asia/Colombo).
 * Instantiated dates here are fixtures for the checker — they are not used
 * by the application telemetry generator.
 */
import {
  floorToInterval,
  formatChartDate,
  formatMonthYear,
  formatShortDate,
  getColomboParts,
  getCurrentMonth,
  getEnergyConsumptionPeriods,
  getPreviousMonth,
  getSevenDayRange,
  getToday,
  getYesterday,
  zonedColomboDate,
} from '../src/utils/dates.ts'

let failed = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✓ ${message}`)
  } else {
    failed += 1
    console.error(`✗ ${message}`)
  }
}

function monthOf(period: { year: number; month: number }): string {
  return `${period.year}-${String(period.month).padStart(2, '0')}`
}

console.log('=== Calendar periods (Asia/Colombo) ===\n')

const afternoon = zonedColomboDate(2026, 8, 25, 10, 0, 0)
assert(formatShortDate(getToday(afternoon)) === 'Aug 25', 'Today is Aug 25')
assert(formatShortDate(getYesterday(afternoon)) === 'Aug 24', 'Yesterday is Aug 24')
assert(formatMonthYear(getCurrentMonth(afternoon).start) === 'August 2026', 'This month is August 2026')
assert(formatMonthYear(getPreviousMonth(afternoon).start) === 'July 2026', 'Last month is July 2026')
assert(monthOf(getCurrentMonth(afternoon)) === '2026-08', 'Current month key 2026-08')
assert(monthOf(getPreviousMonth(afternoon)) === '2026-07', 'Previous month key 2026-07')

const jan5 = zonedColomboDate(2027, 1, 5, 9, 0, 0)
assert(monthOf(getCurrentMonth(jan5)) === '2027-01', 'Jan 5 2027 → this month January 2027')
assert(monthOf(getPreviousMonth(jan5)) === '2026-12', 'Jan 5 2027 → last month December 2026')

const mar1Leap = zonedColomboDate(2028, 3, 1, 8, 0, 0)
assert(monthOf(getPreviousMonth(mar1Leap)) === '2028-02', 'Mar 1 2028 → last month February 2028 (leap year)')
assert(getColomboParts(zonedColomboDate(2028, 2, 29, 12, 0, 0)).day === 29, 'Feb 29 2028 is a valid Colombo date')

const mar1NonLeap = zonedColomboDate(2027, 3, 1, 8, 0, 0)
assert(monthOf(getPreviousMonth(mar1NonLeap)) === '2027-02', 'Mar 1 2027 → last month February 2027')

const beforeMidnight = zonedColomboDate(2026, 8, 24, 23, 59, 30)
const afterMidnight = zonedColomboDate(2026, 8, 25, 0, 0, 30)
assert(formatShortDate(getToday(beforeMidnight)) === 'Aug 24', '23:59 remains Aug 24')
assert(formatShortDate(getToday(afterMidnight)) === 'Aug 25', '00:00 becomes Aug 25 without a reload')
assert(formatShortDate(getYesterday(afterMidnight)) === 'Aug 24', 'Yesterday after midnight is Aug 24')

assert(
  formatChartDate(afternoon.getTime(), afternoon) === 'Today',
  'Chart relative label: Today',
)
assert(
  formatChartDate(getYesterday(afternoon).getTime(), afternoon) === 'Yesterday',
  'Chart relative label: Yesterday',
)
assert(
  formatChartDate(zonedColomboDate(2026, 8, 23).getTime(), afternoon) === 'Aug 23',
  'Chart relative label: Aug 23',
)

console.log('\n=== Energy period descriptors ===\n')

const energy = getEnergyConsumptionPeriods(afternoon)
assert(energy[0]?.label === 'Today' && energy[0]?.detail === 'Aug 25', 'Energy Today → Aug 25')
assert(energy[1]?.label === 'Yesterday' && energy[1]?.detail === 'Aug 24', 'Energy Yesterday → Aug 24')
assert(energy[2]?.label === 'This Month' && energy[2]?.detail === 'August 2026', 'Energy This Month → August 2026')
assert(energy[3]?.label === 'Last Month' && energy[3]?.detail === 'July 2026', 'Energy Last Month → July 2026')

const energyJan = getEnergyConsumptionPeriods(jan5)
assert(energyJan[2]?.detail === 'January 2027', 'Energy this month on Jan 5 is January 2027')
assert(energyJan[3]?.detail === 'December 2026', 'Energy last month on Jan 5 is December 2026')

console.log('\n=== Rolling 7-day range ===\n')

const { start, end } = getSevenDayRange(afternoon, 7)
assert(end.getTime() === afternoon.getTime(), 'Range end is the supplied now')
assert(
  Math.abs(end.getTime() - start.getTime() - 7 * 24 * 60 * 60 * 1000) < 1,
  'Range is exactly 7 × 24 hours',
)
assert(formatShortDate(start) === 'Aug 18', '7-day window starting Aug 18 afternoon (approx Aug 19→25)')

console.log('\n=== 5-minute historical timestamps ===\n')

const INTERVAL_MS = 5 * 60 * 1000
const POINT_COUNT = 7 * 24 * 12
const sampleNow = zonedColomboDate(2026, 8, 25, 10, 3, 27)
const endMs = floorToInterval(getSevenDayRange(sampleNow, 7).end.getTime(), INTERVAL_MS)
const startMs = endMs - (POINT_COUNT - 1) * INTERVAL_MS
const stamps: number[] = []
for (let i = 0; i < POINT_COUNT; i++) {
  stamps.push(startMs + i * INTERVAL_MS)
}

assert(POINT_COUNT === 2016, '7 × 24 × 12 = 2,016 intervals')
assert(stamps.length === 2016, 'Generated 2,016 timestamps')
assert(stamps[stamps.length - 1]! === endMs, 'Last timestamp is the current 5-minute slot')
assert(stamps[stamps.length - 1]! <= sampleNow.getTime(), 'No future timestamps')
assert(
  stamps.every((ms, i) => i === 0 || ms - stamps[i - 1]! === INTERVAL_MS),
  'Every step is 5 minutes',
)
assert(
  formatShortDate(new Date(stamps[0]!)) === 'Aug 18',
  'First sample falls on Aug 18 (rolling window)',
)
assert(
  formatShortDate(new Date(stamps[stamps.length - 1]!)) === 'Aug 25',
  'Last sample falls on Aug 25',
)

const nextDay = zonedColomboDate(2026, 8, 26, 10, 3, 27)
const nextEnd = floorToInterval(getSevenDayRange(nextDay, 7).end.getTime(), INTERVAL_MS)
assert(
  formatShortDate(new Date(nextEnd - (POINT_COUNT - 1) * INTERVAL_MS)) === 'Aug 19',
  'Tomorrow the window starts on Aug 19 without code changes',
)
assert(formatShortDate(new Date(nextEnd)) === 'Aug 26', 'Tomorrow the window ends on Aug 26')

console.log('\n=== Wall clock (today) ===\n')

const liveNow = new Date()
const liveToday = getToday(liveNow)
const liveParts = getColomboParts(liveNow)
console.log(
  `Now (Colombo): ${liveParts.year}-${String(liveParts.month).padStart(2, '0')}-${String(liveParts.day).padStart(2, '0')} ${String(liveParts.hour).padStart(2, '0')}:${String(liveParts.minute).padStart(2, '0')}`,
)
console.log(`Today label: ${formatShortDate(liveToday)}`)
console.log(`Yesterday label: ${formatShortDate(getYesterday(liveNow))}`)
console.log(`This month: ${formatMonthYear(getCurrentMonth(liveNow).start)}`)
console.log(`Last month: ${formatMonthYear(getPreviousMonth(liveNow).start)}`)
assert(liveToday.getTime() <= liveNow.getTime(), 'Today starts at or before now')
assert(getYesterday(liveNow).getTime() < liveToday.getTime(), 'Yesterday is before today')

if (failed > 0) {
  console.error(`\nDynamic date verification FAILED (${failed} assertion(s))`)
  process.exit(1)
}

console.log('\nDynamic date verification PASSED')
