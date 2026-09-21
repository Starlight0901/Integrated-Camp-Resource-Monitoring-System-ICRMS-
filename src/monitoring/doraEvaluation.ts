import type { Dora, DoraReadings, DoraResourceKey, DoraStatus } from '@/types'
import {
  DORA_RESOURCE_DEFINITIONS,
  DORA_RESOURCE_ORDER,
} from '@/data/doraConstants'
import { clampDoraReadings, doraStatusRank, worseDoraStatus } from '@/data/doraStatusDerivation'
import { evaluateDoraResourceThreshold } from '@/data/doraThresholds'
import { doraResourceReason, doraSummaryMessage } from './doraMessages'
import type {
  DoraAttentionItem,
  DoraEvaluation,
  DoraGroupEvaluation,
  DoraResourceEvaluation,
} from './doraTypes'

export function evaluateDoraResource(
  resource: DoraResourceKey,
  value: number,
): DoraResourceEvaluation {
  const definition = DORA_RESOURCE_DEFINITIONS[resource]
  const hit = evaluateDoraResourceThreshold(resource, value)

  return {
    resource,
    label: definition.label,
    value,
    unit: definition.unit,
    status: hit?.severity ?? 'normal',
    threshold: hit?.threshold ?? null,
    thresholdKind: hit?.severity ?? null,
    thresholdDescription: hit?.thresholdDescription ?? null,
    reason: doraResourceReason(resource, hit),
  }
}

export function evaluateDora(
  dora: Pick<Dora, 'id' | 'name'> & DoraReadings,
): DoraEvaluation {
  const readings = clampDoraReadings(dora)
  const resources = DORA_RESOURCE_ORDER.map((resource) =>
    evaluateDoraResource(resource, readings[resource]),
  )

  const status = resources.reduce<DoraStatus>(
    (current, resource) => worseDoraStatus(current, resource.status),
    'normal',
  )

  const attentionResources = resources
    .filter((resource) => resource.status !== 'normal')
    .sort((a, b) => doraStatusRank(b.status) - doraStatusRank(a.status))

  const primaryIssue = attentionResources[0] ?? null

  return {
    doraId: dora.id,
    doraName: dora.name,
    status,
    resources,
    attentionResources,
    primaryIssue,
    summary: doraSummaryMessage(status, attentionResources.length),
  }
}

export function getDoraResourceEvaluation(
  evaluation: DoraEvaluation,
  resource: DoraResourceKey,
): DoraResourceEvaluation | undefined {
  return evaluation.resources.find((item) => item.resource === resource)
}

export function evaluateDoraGroup(doras: Dora[]): DoraGroupEvaluation {
  const evaluations = doras.map(evaluateDora)

  const attentionItems: DoraAttentionItem[] = evaluations
    .flatMap((evaluation) =>
      evaluation.attentionResources.map((resource) => ({
        doraId: evaluation.doraId,
        doraName: evaluation.doraName,
        doraStatus: evaluation.status,
        resource,
      })),
    )
    .sort((a, b) => doraStatusRank(b.doraStatus) - doraStatusRank(a.doraStatus))

  return {
    total: evaluations.length,
    normalCount: evaluations.filter((item) => item.status === 'normal').length,
    warningCount: evaluations.filter((item) => item.status === 'warning').length,
    criticalCount: evaluations.filter((item) => item.status === 'critical').length,
    evaluations,
    attentionItems,
  }
}
