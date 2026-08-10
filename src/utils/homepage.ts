import type { CampStatus } from '@/types'
import { calculateSystemOperationalStatus } from '@/utils/campStatus'
import type { Camp } from '@/types'
import { formatTimestamp, shortCampLabel } from './formatting'

export function formatLastUpdated(iso: string): string {
  return formatTimestamp(iso)
}

export { shortCampLabel }

/** @deprecated Use calculateSystemOperationalStatus with camps instead. */
export function deriveSystemStatus(
  activeAlarms: { severity: string }[],
): CampStatus {
  if (activeAlarms.some((a) => a.severity === 'critical')) return 'critical'
  if (activeAlarms.some((a) => a.severity === 'warning')) return 'warning'
  return 'online'
}

export function deriveSystemStatusFromCamps(camps: Camp[]): CampStatus {
  return calculateSystemOperationalStatus(camps)
}

export const CAMP_DISPLAY_ORDER = [
  'camp-colombo',
  'camp-trincomalee',
  'camp-jaffna',
  'camp-galle',
] as const

export function sortCampsByDisplayOrder<T extends { id: string }>(camps: T[]): T[] {
  return [...camps].sort(
    (a, b) =>
      CAMP_DISPLAY_ORDER.indexOf(a.id as (typeof CAMP_DISPLAY_ORDER)[number]) -
      CAMP_DISPLAY_ORDER.indexOf(b.id as (typeof CAMP_DISPLAY_ORDER)[number]),
  )
}
