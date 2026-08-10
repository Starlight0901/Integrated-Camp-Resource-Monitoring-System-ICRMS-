import type { Alarm, Camp, CampStatus } from '@/types'
import { getActiveAlarms } from './alarmDerivation'

export interface CampOperationalStatusInput {
  campId: string
  alarms: Alarm[]
  /** Set only when explicitly configured in dummy camp data. */
  offline?: boolean
}

/**
 * Single source of truth for camp operational status.
 *
 * ONLINE    — no active warning/critical alarms
 * WARNING   — at least one active warning alarm
 * CRITICAL  — at least one active critical alarm
 * OFFLINE   — explicitly configured offline (dummy data only)
 */
export function calculateCampOperationalStatus({
  campId,
  alarms,
  offline = false,
}: CampOperationalStatusInput): CampStatus {
  if (offline) return 'offline'

  const activeAlarms = getActiveAlarms(alarms).filter(
    (alarm) => alarm.campId === campId,
  )

  if (activeAlarms.some((alarm) => alarm.severity === 'critical')) {
    return 'critical'
  }

  if (activeAlarms.some((alarm) => alarm.severity === 'warning')) {
    return 'warning'
  }

  return 'online'
}

/** Fleet-wide status for headers — uses the same rules across all camps. */
export function calculateSystemOperationalStatus(camps: Camp[]): CampStatus {
  if (camps.some((camp) => camp.status === 'offline')) return 'offline'
  if (camps.some((camp) => camp.status === 'critical')) return 'critical'
  if (camps.some((camp) => camp.status === 'warning')) return 'warning'
  return 'online'
}

export function enrichCampsWithOperationalStatus(
  camps: Camp[],
  alarms: Alarm[],
  offlineByCampId: Record<string, boolean> = {},
): Camp[] {
  return camps.map((camp) => ({
    ...camp,
    status: calculateCampOperationalStatus({
      campId: camp.id,
      alarms,
      offline: offlineByCampId[camp.id] ?? false,
    }),
  }))
}

export function getOfflineCampIds(
  profiles: Array<{ id: string; offline?: boolean }>,
): Record<string, boolean> {
  return Object.fromEntries(
    profiles.filter((p) => p.offline).map((p) => [p.id, true]),
  )
}
