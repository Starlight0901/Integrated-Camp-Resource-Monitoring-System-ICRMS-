/**
 * Central date/time helpers for SLNAFMS.
 *
 * Calendar boundaries and labels use Sri Lanka Standard Time (Asia/Colombo).
 * Sri Lanka does not observe DST; UTC+5:30 is a stable offset.
 */

export const APP_TIME_ZONE = 'Asia/Colombo'
export const APP_TIME_ZONE_OFFSET_HOURS = 5.5

const DAY_MS = 24 * 60 * 60 * 1000
const MINUTE_MS = 60 * 1000
const OFFSET_MS = APP_TIME_ZONE_OFFSET_HOURS * 60 * 60 * 1000

const COLOMBO_PARTS = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const SHORT_DATE = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  month: 'short',
  day: 'numeric',
})

const MONTH_YEAR = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  month: 'long',
  year: 'numeric',
})

export interface CalendarParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export interface DateRange {
  start: Date
  end: Date
}

export interface MonthPeriod {
  year: number
  month: number
  start: Date
}

export interface EnergyPeriodDescriptor {
  key: 'today' | 'yesterday' | 'thisMonth' | 'lastMonth'
  label: string
  detail: string
}

/** System/browser clock — single source of "now" for telemetry date logic. */
export function getCurrentDate(): Date {
  return new Date()
}

export function floorToInterval(ms: number, intervalMs: number): number {
  return Math.floor(ms / intervalMs) * intervalMs
}

export function floorToMinute(ms: number): number {
  return floorToInterval(ms, MINUTE_MS)
}

export function getColomboParts(date: Date): CalendarParts {
  const map: Record<string, string> = {}
  for (const part of COLOMBO_PARTS.formatToParts(date)) {
    if (part.type !== 'literal') map[part.type] = part.value
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  }
}

/** Instant corresponding to a civil date/time in Asia/Colombo. */
export function zonedColomboDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, second) - OFFSET_MS,
  )
}

export function startOfDay(date: Date = getCurrentDate()): Date {
  const { year, month, day } = getColomboParts(date)
  return zonedColomboDate(year, month, day)
}

export function getToday(now: Date = getCurrentDate()): Date {
  return startOfDay(now)
}

export function getYesterday(now: Date = getCurrentDate()): Date {
  return startOfDay(new Date(getToday(now).getTime() - DAY_MS))
}

export function getCurrentMonth(now: Date = getCurrentDate()): MonthPeriod {
  const { year, month } = getColomboParts(now)
  return { year, month, start: zonedColomboDate(year, month, 1) }
}

/**
 * Previous calendar month in Asia/Colombo.
 * Uses Date month arithmetic so year boundaries, February, and leap years
 * are handled by the engine rather than hand-rolled month lengths.
 */
export function getPreviousMonth(now: Date = getCurrentDate()): MonthPeriod {
  const { year, month } = getColomboParts(now)
  const cursor = new Date(Date.UTC(year, month - 1, 1))
  cursor.setUTCMonth(cursor.getUTCMonth() - 1)
  const prevYear = cursor.getUTCFullYear()
  const prevMonth = cursor.getUTCMonth() + 1
  return {
    year: prevYear,
    month: prevMonth,
    start: zonedColomboDate(prevYear, prevMonth, 1),
  }
}

export function isSameColomboDay(a: Date, b: Date): boolean {
  const left = getColomboParts(a)
  const right = getColomboParts(b)
  return left.year === right.year && left.month === right.month && left.day === right.day
}

export function colomboDateKey(date: Date): string {
  const { year, month, day } = getColomboParts(date)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Local solar hour in Asia/Colombo (0–24, fractional). */
export function getColomboHour(timestamp: string | Date): number {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const utc =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600
  return (utc + APP_TIME_ZONE_OFFSET_HOURS) % 24
}

export function getSevenDayRange(
  now: Date = getCurrentDate(),
  days = 7,
): DateRange {
  const end = new Date(now.getTime())
  const start = new Date(end.getTime() - days * DAY_MS)
  return { start, end }
}

export function formatShortDate(date: Date): string {
  return SHORT_DATE.format(date)
}

export function formatMonthYear(date: Date): string {
  return MONTH_YEAR.format(date)
}

/**
 * Chart / UI day label: Today, Yesterday, or a short date such as "Aug 24".
 * Always derived from the supplied instant — never a hardcoded calendar date.
 */
export function formatChartDate(
  timestampMs: number,
  now: Date = getCurrentDate(),
): string {
  const date = new Date(timestampMs)
  if (isSameColomboDay(date, now)) return 'Today'
  if (isSameColomboDay(date, getYesterday(now))) return 'Yesterday'
  return formatShortDate(date)
}

/** One tick per Colombo calendar day in [startMs, endMs], plus range endpoints as needed. */
export function getCalendarDayTicks(startMs: number, endMs: number): number[] {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    return []
  }

  const ticks: number[] = []
  const startDayMs = startOfDay(new Date(startMs)).getTime()
  let cursor = startDayMs

  if (cursor < startMs) {
    cursor += DAY_MS
  }

  while (cursor <= endMs) {
    ticks.push(cursor)
    cursor += DAY_MS
  }

  if (ticks.length === 0) {
    ticks.push(endMs)
    return ticks
  }

  if (ticks[0]! > startMs) {
    const startDay = colomboDateKey(new Date(startMs))
    const firstTickDay = colomboDateKey(new Date(ticks[0]!))
    if (startDay !== firstTickDay) {
      ticks.unshift(startMs)
    }
  }

  const lastTick = ticks[ticks.length - 1]!
  const lastDay = colomboDateKey(new Date(lastTick))
  const endDay = colomboDateKey(new Date(endMs))
  if (lastDay !== endDay) {
    ticks.push(endMs)
  }

  return ticks
}

/** Period definitions for the energy summary — labels stay relative; details are live dates. */
export function getEnergyConsumptionPeriods(
  now: Date = getCurrentDate(),
): EnergyPeriodDescriptor[] {
  const today = getToday(now)
  const yesterday = getYesterday(now)
  const thisMonth = getCurrentMonth(now)
  const lastMonth = getPreviousMonth(now)

  return [
    { key: 'today', label: 'Today', detail: formatShortDate(today) },
    { key: 'yesterday', label: 'Yesterday', detail: formatShortDate(yesterday) },
    {
      key: 'thisMonth',
      label: 'This Month',
      detail: formatMonthYear(thisMonth.start),
    },
    {
      key: 'lastMonth',
      label: 'Last Month',
      detail: formatMonthYear(lastMonth.start),
    },
  ]
}
