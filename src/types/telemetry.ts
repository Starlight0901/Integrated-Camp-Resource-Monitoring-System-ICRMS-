import type { MetricKey } from './metric'

export interface TelemetryPoint {
  timestamp: string
  value: number
}

export interface CampTelemetrySeries {
  campId: string
  metric: MetricKey
  points: TelemetryPoint[]
}
