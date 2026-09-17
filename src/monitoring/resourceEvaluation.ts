import type { Metric, MetricKey } from '@/types'
import { METRIC_DEFINITIONS } from '@/types'
import { evaluateMetricAlarm } from '@/data/alarmThresholds'
import {
  recommendationFor,
  resourceMessage,
} from './messages'
import type { ResourceEvaluation } from './types'

export function evaluateResource(
  metric: MetricKey,
  value: number,
  unit: string = METRIC_DEFINITIONS[metric].unit,
): ResourceEvaluation {
  const alarm = evaluateMetricAlarm(metric, value)
  const status = alarm?.severity ?? 'online'

  return {
    metric,
    label: METRIC_DEFINITIONS[metric].label,
    value,
    unit,
    status,
    threshold: alarm?.threshold ?? null,
    thresholdDescription: alarm?.thresholdDescription ?? null,
    message: resourceMessage(metric, value, unit, alarm),
    recommendation: alarm ? recommendationFor(metric) : null,
  }
}

export function evaluateMetric(metric: Metric): ResourceEvaluation {
  return evaluateResource(metric.key, metric.value, metric.unit)
}
