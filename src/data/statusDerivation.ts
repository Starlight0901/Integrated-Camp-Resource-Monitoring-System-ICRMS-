import type { MetricKey } from '@/types'
import { evaluateMetricStatus } from './alarmThresholds'

export function metricStatusForCamp(
  metric: MetricKey,
  value: number,
): ReturnType<typeof evaluateMetricStatus> {
  return evaluateMetricStatus(metric, value)
}

export { evaluateMetricStatus }
