export type AlarmSeverity = 'warning' | 'critical'

export type AlarmStatus = 'active' | 'acknowledged'

export interface Alarm {
  id: string
  campId: string
  campName: string
  metric: import('./metric').MetricKey
  metricLabel: string
  severity: AlarmSeverity
  currentValue: number
  unit: string
  threshold: number
  thresholdDescription: string
  timestamp: string
  status: AlarmStatus
  /** @deprecated Use status === 'active' */
  acknowledged: boolean
}
