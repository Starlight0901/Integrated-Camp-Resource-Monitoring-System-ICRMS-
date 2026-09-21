import type { DoraResourceKey, DoraStatus } from '@/types'

export interface DoraResourceEvaluation {
  resource: DoraResourceKey
  label: string
  value: number
  unit: string
  status: DoraStatus
  threshold: number | null
  thresholdKind: 'warning' | 'critical' | null
  thresholdDescription: string | null
  reason: string
}

export interface DoraEvaluation {
  doraId: string
  doraName: string
  status: DoraStatus
  resources: DoraResourceEvaluation[]
  attentionResources: DoraResourceEvaluation[]
  primaryIssue: DoraResourceEvaluation | null
  summary: string
}

export interface DoraAttentionItem {
  doraId: string
  doraName: string
  doraStatus: DoraStatus
  resource: DoraResourceEvaluation
}

export interface DoraGroupEvaluation {
  total: number
  normalCount: number
  warningCount: number
  criticalCount: number
  evaluations: DoraEvaluation[]
  attentionItems: DoraAttentionItem[]
}
