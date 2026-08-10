import type { MetricKey } from '@/types'

export {
  formatMetricValue,
  formatMetricDisplay,
  formatTelemetryValue,
  formatTelemetryByUnit,
} from './formatting'

export function isMetricKey(value: string): value is MetricKey {
  return (
    value === 'apparentPower' ||
    value === 'temperature' ||
    value === 'waterLevel' ||
    value === 'fuelLevel'
  )
}
