import type { Camp, CampStatus } from '@/types'

/** Fleet-wide status derived from enriched camp records. */
export function calculateSystemOperationalStatus(camps: Camp[]): CampStatus {
  if (camps.some((camp) => camp.status === 'offline')) return 'offline'
  if (camps.some((camp) => camp.status === 'critical')) return 'critical'
  if (camps.some((camp) => camp.status === 'warning')) return 'warning'
  return 'online'
}
