import type { MetricKey } from '@/types'
import type { DerivedAlarmEvaluation } from '@/data/alarmThresholds'
import { METRIC_DEFINITIONS } from '@/types'
import { formatTelemetryByUnit } from '@/utils/formatting'
import type { ResourceStatus } from './types'

const RECOMMENDATIONS: Record<MetricKey, string> = {
  fuelLevel: 'Check fuel availability and schedule replenishment.',
  waterLevel: 'Check tank level and water supply.',
  temperature: 'Inspect temperature conditions and associated equipment.',
  apparentPower: 'Inspect electrical load and power equipment.',
}

export function recommendationFor(metric: MetricKey): string {
  return RECOMMENDATIONS[metric]
}

export function normalResourceMessage(): string {
  return 'Operating within normal range.'
}

export function resourceMessage(
  metric: MetricKey,
  _value: number,
  unit: string,
  evaluation: DerivedAlarmEvaluation | null,
): string {
  if (!evaluation) return normalResourceMessage()

  const label = METRIC_DEFINITIONS[metric].label
  const formattedThreshold = formatTelemetryByUnit(evaluation.threshold, unit)
  const level = evaluation.severity === 'critical' ? 'critical' : 'warning'

  if (metric === 'temperature') {
    return `${label} is above the ${level} threshold of ${formattedThreshold}.`
  }

  if (metric === 'apparentPower') {
    const bound = evaluation.thresholdDescription.includes('lower')
      ? 'lower'
      : 'upper'
    return `${label} is approaching the ${bound} ${level} limit of ${formattedThreshold}.`
  }

  return `${label} is below the ${level} threshold of ${formattedThreshold}.`
}

export function campSummaryMessage(
  status: ResourceStatus | 'offline',
  attentionCount: number,
): string {
  if (status === 'offline') {
    return 'Camp communication is unavailable.'
  }
  if (attentionCount === 0) {
    return 'All monitored resources are operating within normal ranges.'
  }
  if (status === 'critical') {
    return attentionCount === 1
      ? '1 resource requires immediate attention.'
      : `${attentionCount} resources require immediate attention.`
  }
  return attentionCount === 1
    ? '1 resource requires attention.'
    : `${attentionCount} resources require attention.`
}

export function fleetStatement(
  warningCount: number,
  criticalCount: number,
  offlineCount: number,
): string {
  const attention = warningCount + criticalCount
  if (offlineCount > 0 && attention === 0) {
    return offlineCount === 1
      ? '1 camp is currently offline.'
      : `${offlineCount} camps are currently offline.`
  }
  if (attention === 0) {
    return 'All camps are operating within normal ranges.'
  }
  return attention === 1
    ? '1 camp requires attention.'
    : `${attention} camps require attention.`
}

export function shortCardCondition(evaluation: {
  status: ResourceStatus | 'offline'
  primaryIssue: { label: string; message: string } | null
  summary: string
}): string {
  if (evaluation.status === 'offline') {
    return 'Communication unavailable.'
  }
  if (!evaluation.primaryIssue) {
    return 'All monitored resources within normal range.'
  }
  return evaluation.primaryIssue.message
}

export function activityMessage(
  metricLabel: string,
  severity: 'warning' | 'critical',
): string {
  return `${metricLabel} entered ${severity} range.`
}
