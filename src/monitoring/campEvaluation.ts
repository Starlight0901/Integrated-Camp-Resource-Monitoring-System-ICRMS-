import type { Camp, MetricKey } from '@/types'
import { METRIC_CARD_ORDER } from '@/utils/metricConfig'
import { campSummaryMessage } from './messages'
import { evaluateMetric } from './resourceEvaluation'
import type { CampEvaluation, ResourceEvaluation } from './types'

function severityRank(status: ResourceEvaluation['status']): number {
  if (status === 'critical') return 2
  if (status === 'warning') return 1
  return 0
}

export function evaluateCamp(camp: Camp): CampEvaluation {
  const resources = METRIC_CARD_ORDER.map((key) => evaluateMetric(camp.metrics[key]))
  const attentionResources = resources
    .filter((resource) => resource.status !== 'online')
    .sort((a, b) => severityRank(b.status) - severityRank(a.status))

  const primaryIssue = camp.status === 'offline' ? null : (attentionResources[0] ?? null)

  return {
    campId: camp.id,
    campName: camp.name,
    location: camp.location,
    status: camp.status,
    lastUpdated: camp.lastUpdated,
    resources,
    attentionResources: camp.status === 'offline' ? [] : attentionResources,
    primaryIssue,
    summary: campSummaryMessage(
      camp.status === 'offline' ? 'offline' : camp.status === 'online' ? 'online' : camp.status,
      camp.status === 'offline' ? 0 : attentionResources.length,
    ),
  }
}

export function getResourceEvaluation(
  evaluation: CampEvaluation,
  metric: MetricKey,
): ResourceEvaluation | undefined {
  return evaluation.resources.find((resource) => resource.metric === metric)
}
