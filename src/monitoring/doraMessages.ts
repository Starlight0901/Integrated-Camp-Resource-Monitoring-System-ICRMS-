import type { DoraResourceKey, DoraStatus } from '@/types'
import type { DoraResourceThresholdHit } from '@/data/doraThresholds'
import { DORA_RESOURCE_DEFINITIONS } from '@/data/doraConstants'
import { formatTelemetryByUnit } from '@/utils/formatting'

export function doraNormalResourceReason(): string {
  return 'Operating within normal range.'
}

export function doraResourceReason(
  resource: DoraResourceKey,
  hit: DoraResourceThresholdHit | null,
): string {
  if (!hit) return doraNormalResourceReason()

  const label = DORA_RESOURCE_DEFINITIONS[resource].label
  const unit = DORA_RESOURCE_DEFINITIONS[resource].unit
  const formattedThreshold = formatTelemetryByUnit(hit.threshold, unit)
  const level = hit.severity === 'critical' ? 'critical' : 'warning'

  if (resource === 'powerConsumption') {
    return `${label} is at or above the ${level} threshold of ${formattedThreshold}.`
  }

  return `${label} is at or below the ${level} threshold of ${formattedThreshold}.`
}

export function doraSummaryMessage(
  status: DoraStatus,
  attentionCount: number,
): string {
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

export function doraGroupStatement(
  warningCount: number,
  criticalCount: number,
): string {
  const attention = warningCount + criticalCount
  if (attention === 0) {
    return 'All DORAs are operating within normal ranges.'
  }
  return attention === 1
    ? '1 DORA requires attention.'
    : `${attention} DORAs require attention.`
}

export function doraShortCardCondition(evaluation: {
  primaryIssue: { reason: string } | null
}): string {
  if (!evaluation.primaryIssue) {
    return 'All monitored resources within normal range.'
  }
  return evaluation.primaryIssue.reason
}
