import {
  METRIC_DEFINITIONS,
  type CampMetrics,
  type Metric,
  type MetricKey,
} from '@/types'

export function buildMetric(key: MetricKey, value: number): Metric {
  const definition = METRIC_DEFINITIONS[key]
  return {
    key,
    label: definition.label,
    value,
    unit: definition.unit,
  }
}

export function buildCampMetrics(values: Record<MetricKey, number>): CampMetrics {
  return {
    apparentPower: buildMetric('apparentPower', values.apparentPower),
    temperature: buildMetric('temperature', values.temperature),
    waterLevel: buildMetric('waterLevel', values.waterLevel),
    fuelLevel: buildMetric('fuelLevel', values.fuelLevel),
  }
}
