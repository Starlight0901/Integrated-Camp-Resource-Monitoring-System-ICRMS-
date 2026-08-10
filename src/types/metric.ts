export type MetricKey =
  | 'apparentPower'
  | 'temperature'
  | 'waterLevel'
  | 'fuelLevel'

export interface Metric {
  key: MetricKey
  label: string
  value: number
  unit: string
}

export interface CampMetrics {
  apparentPower: Metric
  temperature: Metric
  waterLevel: Metric
  fuelLevel: Metric
}

export const METRIC_DEFINITIONS: Record<
  MetricKey,
  Pick<Metric, 'label' | 'unit'>
> = {
  apparentPower: { label: 'Apparent Power', unit: 'kVA' },
  temperature: { label: 'Temperature', unit: '°C' },
  waterLevel: { label: 'Water Tank', unit: 'm³' },
  fuelLevel: { label: 'Fuel', unit: 'L' },
}
