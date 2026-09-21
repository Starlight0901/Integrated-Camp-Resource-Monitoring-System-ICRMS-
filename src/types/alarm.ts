export type AlarmSeverity = 'warning' | 'critical'

export type AlarmStatus = 'active' | 'acknowledged'

export type AlarmSource = 'camp' | 'dora'

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

export interface DoraAlarm {
  source: 'dora'
  id: string
  doraId: string
  doraName: string
  resource: import('./dora').DoraResourceKey
  resourceLabel: string
  severity: AlarmSeverity
  currentValue: number
  unit: string
  threshold: number
  thresholdDescription: string
  reason: string
  timestamp: string
  status: AlarmStatus
  acknowledged: boolean
}

export type SystemAlarm = Alarm | DoraAlarm

export function isDoraAlarm(alarm: SystemAlarm): alarm is DoraAlarm {
  return 'source' in alarm && alarm.source === 'dora'
}

export function isCampAlarm(alarm: SystemAlarm): alarm is Alarm {
  return !isDoraAlarm(alarm)
}
