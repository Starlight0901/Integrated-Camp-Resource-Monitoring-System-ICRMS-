export type DoraStatus = 'normal' | 'warning' | 'critical'

export type DoraResourceKey = 'fuelLevel' | 'powerConsumption'

export interface DoraLocation {
  latitude: number
  longitude: number
}

/** Instantaneous DORA readings used to derive operational status. */
export interface DoraReadings {
  fuelLevel: number
  powerConsumption: number
}

export interface Dora extends DoraReadings {
  id: string
  name: string
  location: DoraLocation
  /** Derived from monitored values — do not set independently in UI. */
  status: DoraStatus
}

export const DORA_STATUS_LABELS: Record<DoraStatus, string> = {
  normal: 'NORMAL',
  warning: 'WARNING',
  critical: 'CRITICAL',
}
