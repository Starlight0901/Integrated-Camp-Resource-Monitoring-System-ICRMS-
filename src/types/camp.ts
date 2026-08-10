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
}
