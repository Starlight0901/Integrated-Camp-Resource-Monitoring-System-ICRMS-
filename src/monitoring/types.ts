import type { Alarm, CampStatus, MetricKey } from '@/types'

export type ResourceStatus = 'online' | 'warning' | 'critical'

export interface ResourceEvaluation {
  metric: MetricKey
  label: string
  value: number
  unit: string
  status: ResourceStatus
  threshold: number | null
  thresholdDescription: string | null
  message: string
  recommendation: string | null
}

export interface CampEvaluation {
  campId: string
  campName: string
  location: string
  status: CampStatus
  lastUpdated: string
  resources: ResourceEvaluation[]
  attentionResources: ResourceEvaluation[]
  primaryIssue: ResourceEvaluation | null
  summary: string
}

export interface AttentionItem {
  campId: string
  campName: string
  campStatus: CampStatus
  lastUpdated: string
  resource: ResourceEvaluation
  timestamp: string
}

export interface FleetEvaluation {
  totalCamps: number
  normalCount: number
  warningCount: number
  criticalCount: number
  offlineCount: number
  statement: string
  attentionItems: AttentionItem[]
  campEvaluations: CampEvaluation[]
}

export interface ActivityEvent {
  id: string
  type: 'alarm-triggered'
  campId: string
  campName: string
  metric: MetricKey
  metricLabel: string
  severity: Alarm['severity']
  message: string
  timestamp: string
}
