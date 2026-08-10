import type { MetricKey } from '@/types'
import { evaluateMetricStatus } from '@/data/alarmThresholds'

export function metricStatusForCamp(
  metric: MetricKey,
  value: number,
): ReturnType<typeof evaluateMetricStatus> {
  return evaluateMetricStatus(metric, value)
}
