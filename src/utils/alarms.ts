import type { Alarm, AlarmSeverity, AlarmStatus } from '@/types'

export function getActiveAlarms<T extends { status: AlarmStatus }>(alarms: T[]): T[] {
  return alarms.filter((alarm) => alarm.status === 'active')
}

export function getTopAlarmSeverity(
  alarms: Array<{ status: AlarmStatus; severity: AlarmSeverity }>,
): 'warning' | 'critical' | null {
  const active = getActiveAlarms(alarms)
  if (active.some((alarm) => alarm.severity === 'critical')) return 'critical'
  if (active.some((alarm) => alarm.severity === 'warning')) return 'warning'
  return null
}

export function getCampAlarmSeverity(
  campId: string,
  alarms: Alarm[],
): 'warning' | 'critical' | null {
  const campAlarms = getActiveAlarms(alarms).filter(
    (alarm) => alarm.campId === campId,
  )
  if (campAlarms.some((alarm) => alarm.severity === 'critical')) return 'critical'
  if (campAlarms.some((alarm) => alarm.severity === 'warning')) return 'warning'
  return null
}
