import type { EnergyConsumption } from './energy'
import type { CampMetrics } from './metric'

export type CampStatus = 'online' | 'warning' | 'critical' | 'offline'

export interface Camp {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  image: string
  status: CampStatus
  lastUpdated: string
  metrics: CampMetrics
  /** Period energy totals (kWh) — distinct from instantaneous apparent power (kVA). */
  energyConsumption: EnergyConsumption
}
